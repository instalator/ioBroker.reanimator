'use strict';
const utils = require('@iobroker/adapter-core');
const fs = require('fs');
let filesize = require('filesize');

let adapter, object, dir, dirFile, size, sizeFile;
const dataFile = 'objects3.json';
//const dataFile = 'objects.json';
const nameFileFormatSave = 'reanimator_objects_formatted.json';

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
                if (obj.command === 'getListPagination'){
                    getListPagination(obj.message, (res) => {
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
            }
        }
    }));
}

function getListFilter(msg, cb){
    adapter.log.info('start getListFilter');
    const filter = msg.filter;
    const system = msg.system;
    const page = parseInt(msg.page, 10);
    let list = [];
    if (filter){
        Object.keys(object).forEach((key) => {
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
    cb && cb({'sizeFile': sizeFile});
}

function getSize(){
    const stats = fs.statSync(dirFile);
    sizeFile = filesize(stats.size, {round: 2});
}

function delProperty(arr, cb){
    adapter.log.info('start delProperty');
    arr = arr.prop;
    arr.forEach((key) => {
        //console.log(decodeURI(key));
        delete object[decodeURI(key)];
    });
    saveNotFormat(cb);
    cb && cb('Выполнено');
}

function delAllFilterProperty(msg, cb){
    adapter.log.info('start delAllFilterProperty');
    const filter = msg.filter;
    Object.keys(object).forEach((key) => {
        if (~key.indexOf(filter)){
            delete object[decodeURI(key)];
        }
    });
    saveNotFormat(cb);
    cb && cb('Выполнено');
}

function saveNotFormat(cb){
    adapter.log.info('start saveNotFormat');
    const data = JSON.stringify(object);
    fs.writeFile(dir + dataFile, data, (err) => {
        if (err){
            adapter.log.error('writeFile Error - ' + err);
            cb && cb('writeFile Error - ' + err);
        } else {
            adapter.log.debug('Данные сохранены в файл успешно.');
            cb && cb('Данные сохранены в файл успешно');
        }
    });
}

function saveFormat(cb){
    adapter.log.info('start saveFormat');
    const data = JSON.stringify(object, null, 2);
    fs.writeFile(dir + nameFileFormatSave, data, (err) => {
        if (err){
            adapter.log.error('writeFile Error - ' + err);
            cb && cb('writeFile Error - ' + err);
        } else {
            adapter.log.debug('Данные сохранены в файл успешно.');
            cb && cb('Данные успешно сохранены в файл iobroker-data/reanimator_objects_formatted.json');
        }
    });
}

function main(){
    if (!adapter.systemConfig) return;
    adapter.log.info('Start reanimator');
    dir = utils.controllerDir + '/' + adapter.systemConfig.dataDir;
    dirFile = dir + dataFile;
    adapter.log.debug('adapter.config = ' + JSON.stringify(adapter.config));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    getSize();
    backUpFile(() => {
        readFile();
        adapter.setState('info.connection', true, true);
    });
}

function backUpFile(cb){
    adapter.log.info('start backUpFile');
    fs.copyFile(dirFile, dir + 'reanimator_backup_objects.json', (err) => {
        if (!err){
            adapter.log.info(dataFile + ' was copied to ' + 'reanimator_backup_objects.json');
            cb && cb();
        } else {
            adapter.setState('info.connection', false, true);
        }
    });
}

function readFile(cb){
    adapter.log.info('start readFile');
    fs.readFile(dirFile, /*'utf8',*/(err, res) => {
        if (!err){
            try {
                object = JSON.parse(res);
                adapter.log.info('Read OK');
            } catch (err) {
                adapter.log.error('Parse Object.json Error');
                adapter.setState('info.connection', false, true);
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