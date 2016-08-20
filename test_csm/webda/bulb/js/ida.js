$(function () {
    function Luminance (data) {
        $('.bulb-top, .bulb-middle-1, .bulb-middle-2, .bulb-middle-3, .bulb-bottom, .night').css(
            {'background': 'rgb(255, 255, '+ (255 - data[0]) +')'}
        );
    }

    function Mouse (x, y) {
        dan.push('Mouse', [x, y]);
    }

    function iot_app () {
        $('.bulb-top, .bulb-middle-1, .bulb-middle-2, .bulb-middle-3, .bulb-bottom, .night').css(
            {'background': 'rgb(255, 255, 255)'}
        );
    }

    var profile = {
        'dm_name': 'Bulb',
        'df_list': [Luminance],
    }

    var ida = {
        'iot_app': iot_app,
    };

    $(window).mousemove(function (evt) {
        Mouse(evt.clientX, evt.clientY);
    });

    dai(profile, ida);
});
