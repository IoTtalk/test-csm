$(function () {
    $('#da-list > li > a').click(function () {
        $('#main-frame').attr('src', '');
        var da_name = this.text;
        setTimeout(function () {
            $('#main-frame').attr(
                'src',
                'http://'+ window.location.host +'/webda/vpython/app.html#'+ da_name
            );
        }, 100);
    });
});
