const dai = function (profile) {
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
        if (df_func[odf_name]) {
            df_func[odf_name](data);
        }
        else if (odf_name == 'Control') {
            if (data[0] == 'SET_DF_STATUS') {
                dan.push('Control', ['SET_DF_STATUS_RSP', data[1]], function (res) {});
            }
        }
    }

    function initCallback (result) {
        console.log('register:', result);
    }

    dan.init(pull, csmapi.get_endpoint(), mac_addr, profile, initCallback);
    window.onunload = dan.deregister;
    window.onbeforeunload = dan.deregister;
    window.onclose = dan.deregister;
    window.onpagehide = dan.deregister;
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
