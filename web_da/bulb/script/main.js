$(function () {
    function pull (odf_name, data) {
        console.log('pull', odf_name, data);
        if (odf_name == 'Luminance') {
            $('.bulb-top, .bulb-middle-1, .bulb-middle-2, .bulb-middle-3, .bulb-bottom, .night').css(
                {'background': 'rgb(255, 255, '+ (255 - data[0]) +')'}
            );
        }
    }

    dan.init(pull, 'http://localhost:9999', 'test', {
        'd_name': 'sample da',
        'dm_name': 'Bulb',
        'u_name': 'yb',
        'is_sim': false,
        'df_list': ['Luminance', 'IDF'],
    }, function (result) {
        console.log('register:', result);
    });

    $('.bulb-top, .bulb-middle-1, .bulb-middle-2, .bulb-middle-3, .bulb-bottom, .night').css(
        {'background': 'rgb(255, 255, 255)'}
    );
});
