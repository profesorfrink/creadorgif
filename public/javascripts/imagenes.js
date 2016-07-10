'use strict';

$(document).ready( function () {
     var $galeria = $('#galeria');
     $galeria.unitegallery();

     $('ul.pager').on('click', 'li a', function ( e ) {
        var $target = $(e.currentTarget);

        if ( $target.hasClass('disabled') ) {
            e.preventDefault();
            return false;
        }
     })
});