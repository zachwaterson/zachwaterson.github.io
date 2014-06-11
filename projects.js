/**
 * Created by Zach on 6/10/14.
 */

$( document ).ready(function() {
    var delay = 200;
    $('.first').addClass('animated flipInX');

    setTimeout(function () {
            $('.second').show().addClass('animated flipInX');}, delay
    );
    setTimeout(function () {
            $('.third').show().addClass('animated flipInX');}, delay*2
    );
    setTimeout(function () {
            $('.fourth').show().addClass('animated flipInX');}, delay*3
    );
});

