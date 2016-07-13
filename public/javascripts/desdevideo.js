'use strict';
var subtitulos = [];

Handlebars.registerHelper('fechaSrt', function ( value ) {
    return moment( value, 'H:mm:ss.SSS').format('HH:mm:ss,SSS');
});
Handlebars.registerHelper('colorSubtitulo', function ( value ) {
    return value || 'yellow';
});
$(document).ready( function ( ) {
   
    var fin = parseInt($('#hasta').text());
    var $video = $('video.js-video-principal');
    var templateVideo = Handlebars.compile( $('#tplVideoPreview').html());
    var $hdnDuracion = $('#hdnDuracion');
    var $hdnSubtitulosSrt = $('#hdnSubtitulosSrt');
    var $spanTiempo = $('#tiempoActual');

    var templateListaSubtitlos = Handlebars.compile( $('#tplListaSubtitulos').html() );
    var templateTextoSubtitulos = Handlebars.compile( $('#tplSubtitulos').html() );
    var templateSubtitulosSrt = Handlebars.compile ( $('#tplSubtitulosSrt').html() );

    var $formSubtitulo = $('.form-subtitulo');
    var $desde = $formSubtitulo.find('.js-desde');
    var $hasta = $formSubtitulo.find('.js-hasta');
    var $texto = $formSubtitulo.find('.js-texto');
    var $comboColor = $formSubtitulo.find('#slSubtitulos');
    var $botonAgregar = $formSubtitulo.find('.js-agregar-subtitulo');
    var $hdnSubtitulos = $('.js-subtitulo');
    var $rangeSlider = $("#rangeSlider");

    var videoPrincipal = document.getElementById( $video.attr('id') );

    videoPrincipal.addEventListener( 'timeupdate', mostarTiempoVideo, false );

    function mostarTiempoVideo() {
        var tiempo = moment( new Date ).startOf('day').add( videoPrincipal.currentTime, 'seconds').format('H:mm:ss.SSS');
        $spanTiempo.text(tiempo);
    }

    var datos = {
        src: $video.find('source')[0].src,
        poster: $video.attr('poster')
    };
    $('#contenedorPreview').html(templateVideo( datos ));

    $('.js-ayuda').click( function ( e ) {
        introJs().setOptions({
          nextLabel: 'Siguiente',
          prevLabel: 'Anterior',
          skipLabel: 'Saltear',
          doneLabel: 'Listo'
        }).start(); // Start!
    })

    $('.js-tiempo').mask('0:00:00.000');


    $('.js-copiar-desde').click( function (e) {
        e.preventDefault();
        $desde.val( $spanTiempo.text());
    });
    $('.js-copiar-hasta').click( function (e) {
        e.preventDefault();
        $hasta.val( $spanTiempo.text());
    });

    $('.js-fragmento-desde').click( function (e) {
        e.preventDefault();
        var valores = $rangeSlider.rangeSlider('values');
        var valorDesde = parseFloat( moment.duration($spanTiempo.text(), 'H:mm:ss.SSS').asSeconds());
        $rangeSlider.rangeSlider('values', valorDesde, valores.max);
    });

    $('.js-fragmento-hasta').click( function (e) {
        e.preventDefault();
        var valores = $rangeSlider.rangeSlider('values');
        var valorHasta = parseFloat( moment.duration($spanTiempo.text(), 'H:mm:ss.SSS').asSeconds() );
        $rangeSlider.rangeSlider('values', valores.min, valorHasta);
    });

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
        $('#desde').text( data.values.min.toFixed(3) );
        $('#hasta').text( data.values.max.toFixed(3));
        $('#contenedorPreview').html( render ); 

        var videoPreview = $('#contenedorPreview').find('video')[0];
        videoPreview.addEventListener('timeupdate', chequearLimitesVideo, false );
    });

    var onClickAgregarSubtitulo = function ( e ) {
        e.preventDefault();
        var subtitulo = {
            desde: $desde.val(),
            hasta: $hasta.val(),
            texto: $texto.val(),
            color: $comboColor.val()
        };
        subtitulos.push(subtitulo);
        dibujarTemplates();
        $formSubtitulo.find('input').val('');
        $desde.val( subtitulo.hasta );
        $desde.focus();
    };
    function chequearLimitesVideo () {
        var video = $('#contenedorPreview').find('video')[0];
        var tiempos = $(video).find('source')[0].src.split('#t=')[1].split(',');
        var desde = parseFloat ( tiempos[0] );
        var hasta = parseFloat ( tiempos[1] );
        $('#tiempoPreview').text( moment( new Date ).startOf('day').add( video.currentTime, 'seconds').format('H:mm:ss.SSS') );
        if ( video.currentTime > hasta ) {
            video.currentTime = desde;
            video.pause();
        }

    }

    $('#contenedorPreview').on('click', '.js-reproducir-preview', function (e){
        e.preventDefault();
        var $video = $('#contenedorPreview').find('video')[0];
        $video.play();
    });

    $('#contenedorPreview').on('click', '.js-pausar-preview', function (e){
        e.preventDefault();
        var $video = $('#contenedorPreview').find('video')[0];
        $video.pause();
    });

    function dibujarTemplates() {
        var render = templateListaSubtitlos( {subtitulos: subtitulos} );
        $('#contenedorSubtitulos').html(render);
        var textoSubtitulos = templateTextoSubtitulos( {subtitulos: subtitulos} );
        $hdnSubtitulos.val( textoSubtitulos );
        var textoSubtitulosSrt = templateSubtitulosSrt( { subtitulos: subtitulos });
        $hdnSubtitulosSrt.val(textoSubtitulosSrt);
    }

    var onClickEliminarSubtitulo = function ( e ) {
        e.preventDefault();
        var $target = $(e.currentTarget);
        subtitulos.splice( $target.data('index'), 1 );
        dibujarTemplates();
    };



    $('#zonaSubtitulos').on('click', '.js-eliminar-subtitulo', onClickEliminarSubtitulo );
    $botonAgregar.click( onClickAgregarSubtitulo );


var onClickCrearClip = function ( e ) {
    e.preventDefault();
    var nombre = $video.find('source')[0].src.replace(/^.*[\\\/]/, '');
    var datos = {
        nombreArchivo: nombre,
        desde: $('#desde').text(),
        hasta: $('#hasta').text()
    };

    $.ajax({
        url: '/videos/crearclip',
        type: 'POST',
        data: datos
    })
    .done(function() {
        swal("Se ha comenzado con el proceso del clip", "Cuando termine estará disponible en la lista de videos", "success")
    })
    .fail(function() {
        console.log("error");
    })
    .always(function() {
        console.log("complete");
    });
    

};
    var onUpdateRange = function( values, handle, a, b, handlePositions ) {
        var desde = parseInt(values[0]).toFixed(3);
        var hasta = parseInt(values[1]).toFixed(3);
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
    

    $('.js-generar').click( function (e ) {
        e.preventDefault();
        var datos = {
            desde : parseFloat( $('#desde').text( ) ),
            hasta : parseFloat( $('#hasta').text() ),
            filename : $video.attr('id'),
            texto: '',
            subtitulos: $hdnSubtitulosSrt.val(),
            idVideo: $video.attr('id')
        };

        
        $.ajax({
            url: '/generar',
            type: 'POST',
            data: datos
        })
        .done(function() {
            $('#texto').val('');
            swal("Se ha comenzado con el proceso del video", "Cuando termine estará disponible en la lista de imágenes creadas", "success");
        })
        .fail(function( event, jqxhr, settings ) {
            
            sweetAlert('Se produjo un error', event.responseText, 'error');
        })
        .always(function() {
            console.log("complete");
        });
    })
   
    $('.js-crear-clip').click( onClickCrearClip );
});