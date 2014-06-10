/**
 * Created by Zach on 6/10/14.
 */

$( document ).ready(function() {
    handleResize();

    function handleResize(){
        $("section").height($(window).height());
    }
    $(window).bind('resize', handleResize);
});