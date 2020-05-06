const namespace = 'reanimator.' + instance, namespaceLen = namespace.length;
let info;

$(document).ready(function (){
    $('#save_format-btn').click(function (){
        saveFormat();
    });
    $('#get_list-btn').click(function (){
        getListFilter();
    });
    $('#del-btn').click(function (){
        delObject();
    });
    $('#selectAll').change(function() {
        if(this.checked) {
            $("#list-table input[type=checkbox]").prop('checked', true);
        } else {
            $("#list-table input[type=checkbox]").prop('checked', false);
        }
    });
    getInfo();
});

function getInfo(){
    sendTo(namespace, 'getInfo', {}, function (msg){
        if (msg){
            console.log(msg);
            info = msg;
            $('#filesize').text(': ' + info.sizeFile);
        }
    });
}

function delObject(){
    window.parent.$('#connecting').show();
    let arr = [];
    $('#list-table input[type=checkbox]').each(function (){
        if (this.checked){
            arr.push($('#list-table tbody tr').find( 'td#'+this.id).text());
        }
    });
    sendTo(namespace, 'delProperty', {prop: arr}, function (msg){
        window.parent.$('#connecting').hide();
        if (msg){
            showMessage(_(msg), _('Info'), 'error_outline');
            msg = null;
        }
    });
}

function getListFilter(){
    window.parent.$('#connecting').show();
    let filter = $('#filter').val();
    let i = 0;
    sendTo(namespace, 'getListFilter', {filter: filter, system: $('#system').prop('checked')}, function (msg){
        window.parent.$('#connecting').hide();
        if (msg && msg.message){
            console.log(msg);
            $('#list-table tbody tr').remove();
            $('#th-Name').text(' (' + msg.size + ')');
            msg.message.forEach((key) => {
                i++;
                const append = '<tr><td style="text-align: center;"><label><input id = "' + i + '" type="checkbox" class="filled-in"/><span></span></label></td><td id = "' + i + '" >' + key + '</td></tr>';
                $('#list-table tbody').append(append);
            });
            $('#list-table input[type=checkbox]').click(function (){
                $('#del-btn').removeClass('disabled');
            });
            $('#selectAll').prop('disabled', false);
        }
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