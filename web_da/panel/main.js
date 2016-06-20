function send (feature, data) {
    if (!(data instanceof Array)) {
        data = [data];
    }

    $.ajax({
        'url': '/EASYCONNECT_PANEL/'+ feature,
        'method': 'PUT',
        'contentType': 'application/json',
        'data': JSON.stringify({'data': data}),
    }).done(function (msg) {
        $('#message').text('Successed: '+ msg);
    }).fail(function (msg) {
        $('#message').text('failed: '+ msg.status +','+ msg.responseText);
    });
}

$(function () {
    console.log('YA');
});
