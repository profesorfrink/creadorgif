'use strict';
var subtitulos = [];

Handlebars.registerHelper('fechaSrt', function ( value ) {
    return moment( value, 'H:mm:ss.SSS').format('HH:mm:ss,SSS');
});
Handlebars.registerHelper('colorSubtitulo', function ( value ) {
    return value || 'yellow';
});
Handlebars.registerHelper('serializar', function ( subtitulo, idx ) {
    subtitulo.idx = idx;
    return JSON.stringify( subtitulo );
});


$(document).ready( function ( ) {
   
    var fin = parseInt($('#hasta').text());
    var $video = $('video.js-video-principal');
    var templateVideo = Handlebars.compile( $('#tplVideoPreview').html());
    var $hdnDuracion = $('#hdnDuracion');
    var $hdnWatermark = $('#hdnWatermark');
    var $hdnSubtitulosSrt = $('#hdnSubtitulosSrt');
    var $spanTiempo = $('#tiempoActual');

    var $spanDesde = $('#desde');

    var templateListaSubtitlos = Handlebars.compile( $('#tplListaSubtitulos').html() );
    var templateTextoSubtitulos = Handlebars.compile( $('#tplSubtitulos').html() );
    var templateSubtitulosSrt = Handlebars.compile ( $('#tplSubtitulosSrt').html() );

    var $formSubtitulo = $('.form-subtitulo');
    var $desde = $formSubtitulo.find('.js-desde');
    var $hasta = $formSubtitulo.find('.js-hasta');
    var $texto = $formSubtitulo.find('.js-texto');
    var $inputColor = $formSubtitulo.find('#colorSubtitulo');
    var $botonAgregar = $formSubtitulo.find('.js-agregar-subtitulo');
    var $hdnSubtitulos = $('.js-subtitulo');
    var $rangeSlider = $("#rangeSlider");
    var $contenedorPreview = $('#contenedorPreview');
    var videoPrincipal = document.getElementById( $video.attr('id') );

    var $zonaSubtitulos = $('#zonaSubtitulos');

    videoPrincipal.addEventListener( 'timeupdate', mostarTiempoVideo, false );

    videoPrincipal.onloadedmetadata = function(metadata) {
        // console.log('metadata', metadata.srcElement.videoWidth);
        var tam;
        if ( metadata.srcElement.videoWidth > 320 ) {
            tam = 320;
        } else {
            tam = metadata.srcElement.videoWidth;
        }
        var slider = $('#cal-width').bootstrapSlider({
            max: metadata.srcElement.videoWidth,
        });

        slider.bootstrapSlider('setValue', tam );

    };
    
    Dropzone.options.uploader = {
            paramName: "file", // El nombre que se usará como parametro para transferir el archivo
            maxFilesize: 1, // MB
            maxFiles: 1, // cantidad máxima de imagenes a subir
            addRemoveLinks: true,
            acceptedFiles: 'image/jpeg, image/pjpeg, image/png',
            dictRemoveFile: "Borrar",
            dictDefaultMessage: "Arrastre una imagen aquí o haga click para seleccionar (Tamaño máximo 1MB)",
            
            init: function() {
                this.on("sending", function(file) {
                  // $botonEnviar.prop('disabled', true);

                });

                this.on( 'complete', function (file, par2){
                  // debugger;
                  // $botonEnviar.prop('disabled', false );
                  console.log(file);
                }),

                
                this.on("maxfilesexceeded", function(file) {
                  alert("Solo se puedem agregar 1 imagen");
                });

                this.on('removedfile', function(file) {
                    $hdnWatermark.val('');
                });

                this.on("success", function(file, responseText) { 
                  //alert("Success.");
                  //console.log( responseText );
                    $hdnWatermark.val( responseText.filename );
                });

            // Using a closure.
            var _this = this;
          }
    };
    function cambiarFormatoFecha(fecha) {
        return moment(fecha, 'HH:mm:ss,SSS').format('H:mm:ss.SSS');
    }
    function getColor (texto) {
        return texto.substring( texto.indexOf('color="') + 7, texto.indexOf('"', 14));
    }
    var onCargarPagina = function () {
        var archSubtitulo = $('#hdnSubtitulo').val() || '';
        if ( archSubtitulo.trim() !== '' ) {
            $.ajax({
                url: '/v/getsub',
                type: 'POST',
                data: { sub: archSubtitulo},
            })
            .done(function( data ) {
                var regex = /(<([^>]+)>)/ig
                var regColor = /<color>(.*?)<\/color>/ig;
                data.forEach( function (subtitulo ) {
                    var sub = {
                        desde: cambiarFormatoFecha( subtitulo.startTime ),
                        hasta: cambiarFormatoFecha( subtitulo.endTime ),
                        texto: subtitulo.text.replace(regex, ""),
                        color: getColor(subtitulo.text)
                    };
                    subtitulos.push(sub);
                });
                dibujarTemplates();
            })
            .fail(function() {
                console.log("error");
            })
            .always(function() {
                console.log("complete");
            });
            
        }
    }
    function setVideoPreview () {
        var videoPreview = $('#contenedorPreview').find('video')[0];
        videoPreview.addEventListener('timeupdate', chequearLimitesVideo, false );
    }
    

    function mostarTiempoVideo() {
        
        var tiempo = moment( new Date ).startOf('day').add( parseFloat( videoPrincipal.currentTime ), 'seconds').format('H:mm:ss.SSS');
        $spanTiempo.text(tiempo);
    }

    var datos = {
        src: $video.find('source')[0].src,
        poster: $video.attr('poster')
    };
    $contenedorPreview.html(templateVideo( datos ));
    
    // $rangeSlider.valuesChanged();

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

    $zonaSubtitulos
    .on( 'click', '.js-subtitulo-desde', function (e) {
        e.preventDefault();
        var $tr = $(e.target).parentsUntil('tbody');
        var val = $tr.find('.tbl-tiempo-desde').text();
        $desde.val(val);
    })
    .on( 'click', '.js-subtitulo-hasta', function (e) {
        e.preventDefault();
        var $tr = $(e.target).parentsUntil('tbody');
        var val = $tr.find('.tbl-tiempo-hasta').text();
        $hasta.val(val);
    });

    $contenedorPreview.on('click', '.js-copiar-preview-desde', function (e) {
        e.preventDefault();
        var valor = $contenedorPreview.find('#tiempoPreview').text();
        $desde.val( valor);
    }).on('click', '.js-copiar-preview-hasta', function (e) {
        e.preventDefault();
        var valor = $contenedorPreview.find('#tiempoPreview').text();
        $hasta.val( valor );
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
     }).on("valuesChanged", function(e, data){
        var t = '#t='+ data.values.min +',' + data.values.max;
        var datos = {
           src: $video.find('source')[0].src + t,
           poster: $video.attr('poster')
        };

        

        var render = templateVideo( datos );
        $spanDesde.text( data.values.min.toFixed(3) );
        $('#hasta').text( data.values.max.toFixed(3));
        $contenedorPreview.html( render ); 

        setVideoPreview();
        agregarSubtitulosVideo();
    });

    var onClickAgregarSubtitulo = function ( e ) {
        e.preventDefault();
        var desde = $desde.val();
        var hasta = $hasta.val();
        var texto = $texto.val();

        if ( desde.length !== 11 ) {
            swal('Error', 'Debe establecer el tiempo desde', 'error');
            return false;
        }

        if ( hasta.length !== 11 ) {
            swal('Error', 'Debe establecer el tiempo hasta', 'error');
            return false;
        }

        if ( texto.trim() === '' ) {
            swal('Error', 'El texto no puede estar vacío', 'error');
            return false;
        }

        var subtitulo = {
            desde: desde,
            hasta: hasta,
            texto: texto,
            color: $inputColor.val()
        };
        var idx = $botonAgregar.attr('data-index');
        if ( idx  ) {
            idx = parseInt(idx);
        } else {
            idx = -1;
        }

        if ( idx > - 1 ) {
            subtitulos[idx] = subtitulo;
            $botonAgregar.attr('data-index', -1);
        } else {
            subtitulos.push(subtitulo);
        }
        
        dibujarTemplates();
        $formSubtitulo.find('input:text').val('');
        $desde.val( subtitulo.hasta );
        $desde.focus();
        agregarSubtitulosVideo();
    };
    function chequearLimitesVideo () {
        var video = $('#contenedorPreview').find('video')[0];
        var tiempos = $(video).find('source')[0].src.split('#t=')[1].split(',');
        var desde = parseFloat ( tiempos[0] );
        var hasta = parseFloat ( tiempos[1] );
        $('#tiempoPreview').text( moment( new Date ).startOf('day').add( parseFloat(video.currentTime - desdeEnFloat()) , 'seconds').format('H:mm:ss.SSS') );
        
        if ( video.currentTime > hasta || video.currentTime < desde ) {
            video.currentTime = desde;
            video.pause();
        }


    }

    function agregarSubtitulosVideo() {
        if ( window.VTTCue) {
            var i, l;
            var video = $('#contenedorPreview').find('video')[0];
            for (i = 0; i < video.textTracks.length; i++) {
                    video.textTracks[i].mode = "disabled";
            }
            video.textTracks[ contadorSubtitulos - 1] = track;
            var track = video.addTextTrack("captions", "Spanish", "es");
            var contadorSubtitulos = video.textTracks.length;
            
            track.mode = "showing";
            l = subtitulos.length;
            for (i=0; i < l; i++) {
                var arrastre = desdeEnFloat();
                var desde = parseFloat( moment.duration( subtitulos[i].desde, 'H:mm:ss.SSS').asSeconds()) + arrastre ;
                var hasta = parseFloat( moment.duration( subtitulos[i].hasta, 'H:mm:ss.SSS').asSeconds()) + arrastre;

                track.addCue(new VTTCue( desde, hasta, subtitulos[i].texto ));
            }

            // volverPreviewAlComienzo();
            
        }
        
    }

    function desdeEnFloat() {
        var valores = $rangeSlider.rangeSlider('values');
        var ret = parseFloat( $('#desde').text() );
        return ret;
    }

    function volverPreviewAlComienzo() {
        var video = $contenedorPreview.find('video')[0];
        video.currentTime = desdeEnFloat();
    }
    $contenedorPreview.on('click', '.js-reproducir-preview', function (e){
        e.preventDefault();
        var $video = $('#contenedorPreview').find('video')[0];
        $video.play();
    });

    $contenedorPreview.on('click', '.js-pausar-preview', function (e){
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
        
        $('#tabla-subtitulos').DataTable({
            'language': {
                'url': '//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Spanish.json'
            }
        });
    }

    var onClickEliminarSubtitulo = function ( e ) {
        e.preventDefault();
        var $target = $(e.currentTarget);
        subtitulos.splice( $target.data('index'), 1 );
        dibujarTemplates();
    };

    var onClickEditarSubtitulo = function (e) {
        e.preventDefault();
        var $target = $(e.currentTarget);
        var $tr = $target.parentsUntil('tbody');
        var subtitulo = JSON.parse($tr.find('.serialized').val());
        $desde.val( subtitulo.desde );
        $hasta.val ( subtitulo.hasta );
        $texto.val( subtitulo.texto );
        $botonAgregar.attr('data-index', subtitulo.idx);
        $inputColor.val(subtitulo.color);
    }



    $zonaSubtitulos
        .on('click', '.js-eliminar-subtitulo', onClickEliminarSubtitulo )
        .on('click', '.js-editar-subtitulo', onClickEditarSubtitulo);
    
    $botonAgregar.click( onClickAgregarSubtitulo );


var onClickCrearClip = function ( e ) {
    e.preventDefault();
    var nombre = $video.find('source')[0].src.replace(/^.*[\\\/]/, '');
    var datos = {
        nombreArchivo: nombre,
        desde: $('#desde').text(),
        hasta: $('#hasta').text(),
        watermark: $('#hdnWatermark').val(),
        ubicacion: $('#cboUbicacion').val(),
        userKey: $('#hdnUserKey').val()
    };

    $.ajax({
        url: '/v/crearclip',
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

        $desde.text( desde);
        $('#hasta').text( hasta);

        var datos = {
            src: $video.find('source')[0].src + t,
            poster: $video.attr('poster')
        };
        var render = templateVideo( datos );

        $contenedorPreview.html( render );
        

    };
    

    $('.js-generar').click( function (e ) {
        e.preventDefault();
        var valoresDefecto = $rangeSlider.rangeSlider('values');
        var datos = {
            desde : parseFloat( valoresDefecto.min ),
            hasta : parseFloat( valoresDefecto.max ),
            filename : $video.attr('id'),
            texto: '',
            subtitulos: $hdnSubtitulosSrt.val(),
            idVideo: $video.attr('id'),
            colores: $('#cal-colores').val(),
            compresion: $('#cal-compresion').val(),
            fps: $('#cal-fps').val(),
            watermark: $('#hdnWatermark').val(),
            ubicacion: $('#cboUbicacion').val(),
            userKey: $('#hdnUserKey').val(),
            width: $('#cal-width').val()
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
    var valoresDefecto = $rangeSlider.rangeSlider('values');
    $rangeSlider.rangeSlider('values', 0.000001, valoresDefecto.max);
    onCargarPagina();
});