$(function () {
    var host = window.location.hostname;
    var port = window.location.port;

    var connection_failed = false;

    var onopen = function () {
        if (connection_failed) {
            window.location.reload();
        }
        console.log('Connected');
    };

    var onclose = function () {
        console.log('Websocket broken, trying to reconnect after 3 seconds');
        connection_failed = true;
        setTimeout(function () {
            ws = new WebSocket('ws://'+ host +':'+ port +'/websocket');
            ws.onopen = onopen;
            ws.onmessage = onmessage;
            ws.onclose = onclose;
            ws.onerror = onclose;
        }, 3000);
    };

    var onmessage = function (evt) {
        var cmd = evt.data.split('|');
        console.log(cmd);
        switch (cmd[0]) {
        case 'RELOAD':
            window.location.reload();
            break;
        case 'DATA':
            var d_id = cmd[1];
            var df_name = cmd[2];
            var data = cmd[3];
            var container = $('#'+ d_id +'-'+ df_name);
            console.log(container);
            if (data.length > 200) {
                data = '[Data too long]';
            }
            container.prepend('<li>'+ data +'</li>');
            if (container.children().length > 5) {
                container.children().get(-1).remove();
            }
            break;
        case 'SELECT':
            var d_id = cmd[1];
            var df_name = cmd[2];
            $('#'+ d_id +'-'+ df_name +'-select').text('Selected');
            break;
        case 'UNSELECT':
            var d_id = cmd[1];
            var df_name = cmd[2];
            $('#'+ d_id +'-'+ df_name +'-select').text('Not selected');
            break;
        }
    };

    var ws = new WebSocket('ws://'+ host +':'+ port +'/websocket');
    ws.onopen = onopen;
    ws.onmessage = onmessage;
    ws.onclose = onclose;
    ws.onerror = onclose;

    send_control = function (cmd, args) {
        ws.send(cmd +'|'+ args.join('|'));
    }

    push = function (d_id, df_name) {
        var raw_text = $('#'+ d_id +'-'+ df_name +'-push').val();
        try {
            var data = JSON.parse('{"data": ['+ raw_text +']}');
            $.ajax({
                'url': '/'+ d_id +'/'+ df_name,
                'method': 'PUT',
                'contentType': 'application/json',
                'data': JSON.stringify(data),
            });
            console.log(data);
        } catch (e) {
            console.log(e);
        }
    }
});
