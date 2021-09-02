'use strict';
const utils = require('@iobroker/adapter-core');
const fs = require('fs');
let filesize = require('filesize');

let adapter, object, states, dir, size, sizeObjectsFile, sizeStatesFile;


function startAdapter(options){
    return adapter = utils.adapter(Object.assign({}, options, {
        name:         'reanimator',
        ready:        main,
        systemConfig: true,
        unload:       (callback) => {
            try {
                adapter.log.info('cleaned everything up...');
                callback();
            } catch (e) {
                callback();
            }
        },
        stateChange:  (id, state) => {
            if (state){
                adapter.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            } else {
                adapter.log.info(`state ${id} deleted`);
            }
        },
        message:      (obj) => {
            if (typeof obj === 'object' && obj.message){
                if (obj.command === 'getInfo'){
                    getInfo((res) => {
                        if (obj.callback) adapter.sendTo(obj.from, obj.command, res, obj.callback);
                    });
                }
                if (obj.command === 'saveFormat'){
                    saveFormat((res) => {
                        if (obj.callback) adapter.sendTo(obj.from, obj.command, res, obj.callback);
                    });
                }
                if (obj.command === 'getListFilter'){
                    getListFilter(obj.message, (res) => {
                        if (obj.callback) adapter.sendTo(obj.from, obj.command, res, obj.callback);
                    });
                }
                if (obj.command === 'delProperty'){
                    delProperty(obj.message, (res) => {
                        if (obj.callback) adapter.sendTo(obj.from, obj.command, res, obj.callback);
                    });
                }
                if (obj.command === 'delAllFilterProperty'){
                    delAllFilterProperty(obj.message, (res) => {
                        if (obj.callback) adapter.sendTo(obj.from, obj.command, res, obj.callback);
                    });
                }
                if (obj.command === 'writeFile'){
                    writeFile(obj.message, (res) => {
                        if (obj.callback) adapter.sendTo(obj.from, obj.command, res, obj.callback);
                    });
                }
            }
        }
    }));
}

function getListFilter(msg, cb){
    adapter.log.info('start getListFilter');
    let obj;
    const filter = msg.filter;
    const system = msg.system;
    const page = parseInt(msg.page, 10);
    const file = msg.file;
    const list = [];
    if (file){
        obj = states;
    } else {
        obj = object;
    }
    if (filter){
        Object.keys(obj).forEach((key) => {
            if (system){
                if (~key.indexOf(filter)){
                    list.push(key);
                }
            } else {
                if (~key.indexOf(filter) && !~key.indexOf('system.adapter')){
                    list.push(key);
                }
            }
        });
        size = list.length;
        list.sort();
        if (size > 1000){
            const from = page * 1000;
            const to = from + 1000;
            cb && cb({message: list.slice(from, to), size: size, page});
        } else {
            cb && cb({message: list, size: size});
        }
    } else {
        cb && cb({error: 'Не задан фильтр'});
    }
}

function getInfo(cb){
    cb && cb({sizeObjectsFile: sizeObjectsFile, sizeStatesFile: sizeStatesFile});
}

function delProperty(arr, cb){
    adapter.log.info('start delProperty');
    arr = arr.prop;
    arr.forEach((key) => {
        delete object[decodeURI(key)];
        delete states[decodeURI(key)];
    });
    saveNotFormat(() => {
        getFileSize('reanimator_work_objects.json',() => {
            getFileSize('reanimator_work_states.json',() => {
                cb && cb('Выполнено');
            });
        });
    });
}

function delAllFilterProperty(msg, cb){
    adapter.log.info('start delAllFilterProperty');
    const filter = msg.filter;
    const system = msg.system;
    Object.keys(object).forEach((key) => {
        if (system){
            if (~key.indexOf(filter)){
                delete object[decodeURI(key)];
            }
        } else {
            if (~key.indexOf(filter) && !~key.indexOf('system.adapter')){
                delete object[decodeURI(key)];
            }
        }
    });
    saveNotFormat(() => {
        getFileSize(() => {
            cb && cb('Выполнено');
        });
    });
}

function saveNotFormat(cb){
    adapter.log.info('start saveNotFormat');
    const dataObjects = JSON.stringify(object);
    const dataStates = JSON.stringify(states);
    fs.writeFileSync(dir + 'reanimator_work_objects.json', dataObjects);
    fs.writeFileSync(dir + 'reanimator_work_states.json', dataStates);
    cb && cb('Данные сохранены в файл успешно');
}

function writeFile(msg, cb){
    adapter.log.info('start writeFile'); //objects.json.bak
    const dataObjects = JSON.stringify(object);
    const dataStates = JSON.stringify(states);
    fs.writeFileSync(dir + 'objects.json', dataObjects);
    fs.writeFileSync(dir + 'objects.json.bak', dataObjects);
    fs.writeFileSync(dir + 'states.json', dataStates);
    fs.writeFileSync(dir + 'states.json.bak', dataStates);
    cb && cb();
}

function saveFormat(cb){
    adapter.log.info('start saveFormat');
    const dataObjects = JSON.stringify(object, null, 2);
    const dataStates = JSON.stringify(states, null, 2);
    fs.writeFileSync(dir + 'reanimator_formatted_objects.json', dataObjects);
    fs.writeFileSync(dir + 'reanimator_formatted_states.json', dataStates);
    cb && cb('OK');
}

function main(){
    if (!adapter.systemConfig) return;
    adapter.log.info('Start reanimator');
    dir = utils.controllerDir + '/' + adapter.systemConfig.dataDir;
    adapter.log.debug('adapter.config = ' + JSON.stringify(adapter.config));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    backUpFile('objects.json', () => {
        copyFile('objects.json', () => {
            readFile('objects.json');
            adapter.setState('info.connection', true, true);
        });
    });
    backUpFile('states.json', () => {
        copyFile('states.json', () => {
            readFile('states.json');
            adapter.setState('info.connection', true, true);
        });
    });
}

function copyFile(file, cb){
    adapter.log.info('start copyFile ' + file);
    fs.copyFile(dir + file, dir + 'reanimator_work_' + file, (err) => {
        if (!err){
            adapter.log.info(file + ' was copied to ' + 'reanimator_work_' + file);
            cb && cb();
        } else {
            adapter.setState('info.connection', false, true);
        }
    });
}

function backUpFile(file, cb){
    adapter.log.info('start backUpFile ' + file);
    fs.copyFile(dir + file, dir + 'reanimator_backup_' + file, (err) => {
        if (!err){
            adapter.log.info(file + ' was copied to ' + 'reanimator_backup_' + file);
            cb && cb();
        } else {
            adapter.setState('info.connection', false, true);
        }
    });
}

function readFile(file, cb){
    adapter.log.info('start readFile ' + file);
    getFileSize(file, () => {
        fs.readFile(dir + file, (err, res) => {
            if (!err){
                try {
                    if (~file.indexOf('objects')){
                        object = JSON.parse(res);
                    } else {
                        states = JSON.parse(res);
                    }
                    adapter.log.info('Read ' + file + ' OK');
                } catch (err) {
                    adapter.log.error('Parse ' + file + ' Error');
                    adapter.setState('info.connection', false, true);
                }
                cb && cb();
            } else {
                adapter.setState('info.connection', false, true);
            }
        });
    });
}

function getFileSize(file, cb){
    fs.stat(dir + file, (err, stats) => {
        if (!err){
            if (~file.indexOf('objects')){
                sizeObjectsFile = filesize(stats.size, {round: 2});
            } else {
                sizeStatesFile = filesize(stats.size, {round: 2});
            }
            cb && cb();
        } else {
            adapter.setState('info.connection', false, true);
        }
    });
}

if (module.parent){
    module.exports = startAdapter;
} else {
    startAdapter();
}