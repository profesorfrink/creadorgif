'use strict';
var subtitulos = [];
$(document).ready( function ( ) {
    var connectSlider = document.getElementById('range');
    var fin = parseInt($('#hasta').text());
    var $video = $('video.js-video-principal');
    var templateVideo = Handlebars.compile( $('#tplVideoPreview').html());

    var templateListaSubtitlos = Handlebars.compile( $('#tplListaSubtitulos').html() );
    var templateTextoSubtitulos = Handlebars.compile( $('#tplSubtitulos').html() );

    var $formSubtitulo = $('.form-subtitulo');
    var $desde = $formSubtitulo.find('.js-desde');
    var $hasta = $formSubtitulo.find('.js-hasta');
    var $texto = $formSubtitulo.find('.js-texto');
    var $botonAgregar = $formSubtitulo.find('.js-agregar-subtitulo');
    var $hdnSubtitulos = $('.js-subtitulo');
    var $rangeSlider = $("#rangeSlider");

    $('.js-tiempo').mask('0:00:00.000');
    var max = $rangeSlider.data('hasta');
    $rangeSlider.rangeSlider({ 
        defaultValues: { 
            min: 0, 
            max: max
        },
        bounds: {
            min: 0,
            max: max
        },
        step: 0.01,
        formatter: function(val){
                    var value = moment( new Date ).startOf('day').add( val, 'seconds').format('H:mm:ss.SSS');
                    return value;
                    
            }
     }).bind("valuesChanged", function(e, data){
        var t = '#t='+ data.values.min +',' + data.values.max;
        var datos = {
           src: $video.find('source')[0].src + t,
           poster: $video.attr('poster')
        };
        var render = templateVideo( datos );
        $('#desde').text( data.values.min );
        $('#hasta').text( data.values.max);
        $('#contenedorPreview').html( render ); 
    });

    var onClickAgregarSubtitulo = function ( e ) {
        e.preventDefault();
        var subtitulo = {
            desde: $desde.val(),
            hasta: $hasta.val(),
            texto: $texto.val()
        };
        subtitulos.push(subtitulo);
        var render = templateListaSubtitlos( {subtitulos: subtitulos} );
        $('#contenedorSubtitulos').html(render);
        var textoSubtitulos = templateTextoSubtitulos( {subtitulos: subtitulos} );
        $hdnSubtitulos.val( textoSubtitulos );
        $formSubtitulo.find('input').val('');
        $desde.val( subtitulo.hasta );
        $desde.focus();
    };

    $botonAgregar.click( onClickAgregarSubtitulo );

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
            texto: $('#texto').val(),
            subtitulos: $hdnSubtitulos.val()
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
        .fail(function( event, jqxhr, settings ) {
            
            sweetAlert('Se produjo un error', event.responseText, 'error');
        })
        .always(function() {
            console.log("complete");
        });
    })
   
    connectSlider.noUiSlider.on('update', onUpdateRange);
});