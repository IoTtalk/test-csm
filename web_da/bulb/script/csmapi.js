var csmapi = (function () {
    var ENDPOINT = 'http://localhost:9999';
    var _mac_addr = '';

    function set_endpoint (endpoint) {
        ENDPOINT = endpoint;
    }

    function get_endpoint () {
        return ENDPOINT;
    }

    function register (mac_addr, profile, callback) {
        _mac_addr = mac_addr;
        $.ajax({
            type: 'POST',
            url: ENDPOINT +'/'+ mac_addr,
            data: JSON.stringify({'profile': profile}),
            contentType:"application/json; charset=utf-8",
        }).done(function () {
            callback(true);
        }).fail(function () {
            callback(false);
        });
    }

    function deregister (callback) {
        $.ajax({
            type: 'DELETE',
            url: ENDPOINT +'/'+ _mac_addr,
            contentType:"application/json; charset=utf-8",
        }).done(function () {
            callback(true);
        }).fail(function () {
            callback(false);
        });
    }

    function pull (odf_name, callback) {
        $.ajax({
            type: 'GET',
            url: ENDPOINT +'/'+ _mac_addr +'/'+ odf_name,
            contentType:"application/json; charset=utf-8",
        }).done(function (text) {
            callback(JSON.parse(text)['samples']);
        }).fail(function () {
            callback([]);
        });
    }

    function push (idf_name, data, callback) {
        $.ajax({
            type: 'PUT',
            url: ENDPOINT +'/'+ _mac_addr +'/'+ idf_name,
            data: JSON.stringify({'data': data}),
            contentType:"application/json; charset=utf-8",
        }).done(function () {
            callback(true);
        }).fail(function () {
            callback(false);
        });
    }

    return {
        'set_endpoint': set_endpoint,
        'get_endpoint': get_endpoint,
        'register': register,
        'deregister': deregister,
        'pull': pull,
        'push': push,
    };
})();
