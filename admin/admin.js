const namespace = 'reanimator.' + instance, namespaceLen = namespace.length;
let info, isAlive, page = 0, list = [];

$(document).ready(function (){
    sockets();
    $('#save_format-btn').click(function (){
        saveFormat();
    });
    $('#get_list-btn').click(function (){
        if (!isAlive){
            showMessage(_('driver is not running'), _('Error'), 'error_outline');
        } else {
            const filter = $('#filter').val();
            page = 0;
            getListFilter(filter);
        }
    });
    $('#del-btn').click(function (){
        delObject();
    });
    $('#write-btn').click(function (){
        writeFile();
    });
    $('#del_all-btn').click(function (){
        const filter = $('#filter').val();
        delAllFilterObject(filter);
    });
    $('#selectAll').change(function (){
        if (this.checked){
            $('#list-table input[type=checkbox]').prop('checked', true);
            $('#del-btn').removeClass('disabled');
        } else {
            $('#list-table input[type=checkbox]').prop('checked', false);
        }
    });
    getInfo();
    setTimeout(() => {
        $('.adapter-body').find('.help-link').remove();
    }, 100);

});

function sockets(){
    socket.emit('getObject', 'system.config', function (err, res){
        if (!err && res && res.common){
            systemLang = res.common.language || systemLang;
            systemConfig = res;
        }
    });
    console.log('isAlive');
    socket.emit('getState', 'system.adapter.' + namespace + '.alive', function (err, res){
        if (!err && res){
            console.log('isAlive = ' + res.val);
            isAlive = res.val;
        } else {
            console.log('err isAlive = ' + res);
            isAlive = false;
        }
    });
}

function getInfo(){
    sendTo(namespace, 'getInfo', {}, function (msg){
        if (msg){
            console.log(msg);
            info = msg;
            $('#filesize').text(': ' + info.sizeObjectsFile);
            $('#filesize').text(': ' + info.sizeStatesFile);
        }
    });
}

function writeFile(){
    window.parent.$('#connecting').show();
    sendTo(namespace, 'writeFile', {}, function (msg){
        window.parent.$('#connecting').hide();
    });
}

function delObject(){
    window.parent.$('#connecting').show();
    let arr = [];
    $('#list-table input[type=checkbox]').each(function (){
        if (this.checked){
            console.log('this.id - ' + this.id - 1);
            arr.push(list[this.id - 1]);
            //arr.push($('#list-table tbody tr').find('td#' + this.id).text());
        }
    });
    sendTo(namespace, 'delProperty', {prop: arr}, function (msg){
        window.parent.$('#connecting').hide();
        const filter = $('#filter').val();
        getInfo();
        getListFilter(filter);
    });
}

function delAllFilterObject(filter){
    window.parent.$('#connecting').show();
    sendTo(namespace, 'delAllFilterProperty', {filter: filter, system: $('#system').prop('checked')}, function (msg){
        window.parent.$('#connecting').hide();
        const filter = $('#filter').val();
        getInfo();
        getListFilter(filter);
    });
}

function getListFilter(filter){
    console.log('getListFilter');
    window.parent.$('#connecting').show();
    let i = 0;
    sendTo(namespace, 'getListFilter', {filter: filter, system: $('#system').prop('checked'), file: $('#states').prop('checked'), page: page}, function (msg){
            window.parent.$('#connecting').hide();
            if (msg && msg.message){
                console.log(msg);
                list = msg.message;
                const maxPage = parseFloat(msg.size / 1000).toFixed(0) - 1;
                $('#list-table tbody tr').remove();

                let append = ' (list: ' + msg.message.length + ' of ' + msg.size + ')     ';
                if (maxPage > 0){
                    append = append + '<button id="prev-btn" class="waves-effect waves-light btn-flat" type="submit" name="prev"><span class="translate"></span>' +
                        '<i class="material-icons left">keyboard_arrow_left</i>' +
                        '</button> ' +
                        ' page: ' + msg.page + ' of ' + maxPage +
                        ' <button id="next-btn" class="waves-effect waves-light btn-flat" type="submit" name="next"><span class="translate"></span>' +
                        '<i class="material-icons left">keyboard_arrow_right</i>' +
                        '</button>';
                }
                $('#th-Name').html(append);

                $('#prev-btn').click(function (){
                    page--;
                    if (page < 0) page = maxPage;
                    getListFilter(filter);
                });
                $('#next-btn').click(function (){
                    page++;
                    if (page > maxPage) page = 0;
                    getListFilter(filter);
                });

                msg.message.forEach((key) => {
                    i++;
                    const append = '<tr><td style="text-align: center;"><label><input id = "' + i + '" type="checkbox" class="filled-in"/><span></span></label></td><td id = "' + i + '" ><pre>' + escape_html(key) + '</pre></td></tr>';
                    $('#list-table tbody').append(append);
                });

                $('#list-table input[type=checkbox]').click(function (){
                    $('#del-btn').removeClass('disabled');
                });

                $('#del_all-btn').removeClass('disabled');
                $('#selectAll').prop('disabled', false);
            } else if (msg.error){
                showMessage(_(msg.error), _('Error'), 'error_outline');
                msg = null;
            }
        }
    )
    ;
}

function escape_html(str){
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();
    const map = {
        '&':  '&amp;',
        '<':  '&lt;',
        '>':  '&gt;',
        '"':  '&quot;',
        '\'': '&#39;',
        '/':  '&#x2F;',
        '`':  '&#x60;',
        '=':  '&#x3D;',
        '\n': '\\n',
        '\t': '\\t',
        '\r': '\\r'
    };
    return str.replace(/[&<>"'`=\/\n\t\r]/g, function (m){
        return map[m];
    });
}

function saveFormat(){
    window.parent.$('#connecting').show();
    sendTo(namespace, 'saveFormat', {}, function (msg){
        window.parent.$('#connecting').hide();
        if (msg){
            showMessage(_(msg), _('Info'), 'error_outline');
            msg = null;
        }
    });
}

function load(settings, onChange){
    if (!settings) return;
    /*$('.value').each(function (){
        var $key = $(this);
        var id = $key.attr('id');
        if ($key.attr('type') === 'checkbox'){
            $key.prop('checked', settings[id])
                .on('change', () => onChange())
            ;
        } else {
            $key.val(settings[id])
                .on('change', () => onChange())
                .on('keyup', () => onChange())
            ;
        }
    });
    onChange(false);
    if (M) M.updateTextFields();*/
}

function save(callback){
    var obj = {};
    $('.value').each(function (){
        var $this = $(this);
        if ($this.attr('type') === 'checkbox'){
            obj[$this.attr('id')] = $this.prop('checked');
        } else {
            obj[$this.attr('id')] = $this.val();
        }
    });
    callback(obj);
}