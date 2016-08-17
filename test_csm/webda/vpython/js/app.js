const dai = function (profile, ida) {
    var df_func = {};
    var mac_addr = (function () {
        function s () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s() + s() + s();
    })();

    if (profile.is_sim == undefined){
        profile.is_sim = false;
    }
    if (profile.d_name == undefined){
        profile.d_name = profile.dm_name + mac_addr.substring(8);
    }
    document.title = profile.d_name;

    for (var i = 0; i < profile.df_list.length; i++) {
        df_func[profile.df_list[i].name] = profile.df_list[i];
        profile.df_list[i] = profile.df_list[i].name;
    }

    function pull (odf_name, data) {
        if (odf_name == 'Control') {
            switch (data[0]) {
            case 'SET_DF_STATUS':
                dan.push('Control', ['SET_DF_STATUS_RSP', data[1]], function (res) {});
                break;
            case 'RESUME':
                ida.suspended = false;
                dan.push('Control', ['RESUME_RSP', ['OK']], function (res) {});
                break;
            case 'SUSPEND':
                ida.suspended = true;
                dan.push('Control', ['SUSPEND_RSP', ['OK']], function (res) {});
                break;
            }
        } else {
            df_func[odf_name](data);
        }
    }

    function initCallback (result) {
        console.log('register:', result);
        ida.iot_app();
    }

    function deregisterCallback (result) {
        console.log('deregister:', result);
    }

    function deregister () {
        dan.deregister(deregisterCallback);
    }

    dan.init(pull, csmapi.get_endpoint(), mac_addr, profile, initCallback);
    window.onunload = deregister;
    window.onbeforeunload = deregister;
    window.onclose = deregister;
    window.onpagehide = deregister;
};

/*==Basic==*/
var audio = {};

const preloadAudio = function(filename) {
    if (audio[filename] == undefined) {
        audio[filename] = new Audio('/webda/vpython/audio/' + filename);
    }
};

const playAudio = function(filename) {
    preloadAudio(filename);
    if (audio[filename] != undefined) {
        audio[filename].play();
    }
};

const execute = function (code) {
    const options = {
        lang: 'vpython',
        version: 2.1
    };

    const js_code = glowscript_compile(code, options);
    program = eval(js_code);

    console.log(js_code);
    program(function(err){
        console.log(err);
    });
};

const fetch_code = function(url){
    $.get(url)
     .done(function (data) {
            execute(data);
     })
     .fail(function (jqxhr, settings, execption) {
            console.log(execption);
    });
};

$(function () {
    var project = window.location.hash.replace(/^#/,'');

    window.__context = {
        glowscript_container: $('#glowscript'),
    };

    fetch_code('/webda/vpython/py/'+ project + '.py');
});
