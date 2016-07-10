'use strict';

$(document).ready( function ( ) {
    var connectSlider = document.getElementById('range');
    var fin = parseInt($('#hasta').text());
    var $video = $('video.js-video-principal');
    var templateVideo = Handlebars.compile( $('#tplVideoPreview').html());

    var onUpdateRange = function( values, handle, a, b, handlePositions ) {
        var desde = parseInt(values[0]).toFixed(0);
        var hasta = parseInt(values[1]).toFixed(0);
        var t = '#t='+ desde +',' + hasta;

        $('#desde').text( desde);
        $('#hasta').text( hasta);

        var datos = {
            src: $video.find('source')[0].src + t,
            poster: $video.attr('poster')
        };
        var render = templateVideo( datos );

        $('#contenedorPreview').html( render );

    };
    noUiSlider.create(connectSlider, {
        start: [0, fin],
        connect: false,
        step: 1,
        range: {
            'min': 0,
            'max': fin
        }
    });

    $('.js-generar').click( function (e ) {
        e.preventDefault();
        var datos = {
            desde : parseInt( $('#desde').text( ) ),
            hasta : parseInt( $('#hasta').text() ),
            filename : $video.attr('id'),
            texto: $('#texto').val()
        };

        
        $.ajax({
            url: '/generar',
            type: 'POST',
            data: datos
        })
        .done(function() {
            $('#texto').val('');
            swal("Se ha comenzado con el proceso del video", "Cuando termine estará disponible en la lista de imágenes creadas", "success")
        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });
    })
   
    connectSlider.noUiSlider.on('update', onUpdateRange);
});