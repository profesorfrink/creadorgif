'use strict';
var api;
$(document).ready( function () {
    
    var $imagenes = $('.animado');

    var wall = new Freewall("#contenedor");
    
    $('#contenedor').waitForImages().done(function() {
        // All descendant images have loaded, now slide up.
        wall.reset({
                selector: '.item',
                animate: true,
                cellW: 20,
                cellH: 200,
                onResize: function() {
                    wall.fitWidth();
                }
        });
        wall.fitWidth();
        $imagenes.jqGifPreview();
        $(window).trigger('resize');

        $imagenes.each( function (idx, val ) {
            var $img = $(val);
            var $parent = $img.parent();
            $parent.append('<div class="loading" />')
            var imagen = new Image();
            imagen.src = $img.data('gif');
            imagen.addEventListener('load', function() {
                //console.log( $parent.html());
                $parent.find('.loading').remove();
            }, false);
        });
    });
});
