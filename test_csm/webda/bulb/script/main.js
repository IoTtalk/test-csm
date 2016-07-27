$(function () {
    function pull (odf_name, data) {
        console.log('pull', odf_name, data);
        if (odf_name == 'Luminance') {
            $('.bulb-top, .bulb-middle-1, .bulb-middle-2, .bulb-middle-3, .bulb-bottom, .night').css(
                {'background': 'rgb(255, 255, '+ (255 - data[0]) +')'}
            );
        }
    }

    var mac_addr = '';
    for (var i = 0; i < 12; i++) {
        mac_addr += '0123456789abcdef'[Math.floor(Math.random() * 16)];
    }

    console.log('Random mac_addr generated:', mac_addr);

    dan.init(pull, 'http://localhost:9999', mac_addr, {
        'dm_name': 'Bulb',
        'u_name': 'yb',
        'is_sim': false,
        'df_list': ['Luminance', 'Mouse'],
    }, function (result) {
        console.log('register:', result);
    });

    $('.bulb-top, .bulb-middle-1, .bulb-middle-2, .bulb-middle-3, .bulb-bottom, .night').css(
        {'background': 'rgb(255, 255, 255)'}
    );

    $(window).mousemove(function (evt) {
        dan.push('Mouse', [evt.clientX, evt.clientY]);
    });

    function deregister () {
        dan.deregister();
    }

    window.onunload = deregister;
    window.onbeforeunload = deregister;
    window.onclose = deregister;
    window.onpagehide = deregister;
});
