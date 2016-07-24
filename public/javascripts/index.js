'use script';

Handlebars.registerHelper('fechaSrt', function ( value ) {
    return moment( value, 'H:mm:ss.SSS').format('HH:mm:ss,SSS');
});
Handlebars.registerHelper('colorSubtitulo', function ( value ) {
    return value || 'yellow';
});

$(document).ready( function () {
    var templateVideo = Handlebars.compile( $('#tplVideo').html() );
    var templateVideoPreview = Handlebars.compile( $('#tplVideoPreview').html() );
    var templateSubtitulos = Handlebars.compile( $('#tplSubtitulosSrt').html() );
    var templateImage = Handlebars.compile( $('#tplImagen').html() );
    var templateYoutube = Handlebars.compile( $('#tplInfoYoutube').html() );
    var $video;
    var $hdnWatermark = $('#hdnWatermark');
    var $espere = $('.espere');
    // var $galeria = $('#galeria');
    var $botonCrear = $('.js-crear-gif');
    var $contenedorVideo = $('#contenedorVideo');
    var $contenedorPreview = $('#contenedorPreview');
    var $contenedorForms = $('.contenedor-forms');
    var $forms = $('form');
    var $spanDesde = $('#desde');
    var $spanHasta = $('#hasta');
    var $btnInfoYoutube = $('.js-info-youtube');
    var $urlYotube =$('#urlYoutube');
    var $contenedorInfoYoutube = $('#contenedorInfoYoutube');
    
    var onVideoSubido = function ( responseText ) {
        $contenedorVideo.find('.espere').addClass('hidden');
        var $details = $('.dz-details');
        var datosRender = {
            filename: responseText.nombre,
            metadata: responseText.metadata,
            snapshot: responseText.screenshot,
            src: responseText.nombre,
            id: responseText._id
        };
        var render = templateVideo( datosRender);
        $contenedorVideo.html(render);

        //var renderPreview = templateVideoPreview(datosRender);
        //$('#contenedorPreview').html( renderPreview );

        $video = $(render);
        var max = parseFloat(responseText.metadata.duration);

        $spanDesde.text(0);
        $spanHasta.text(max);

        $contenedorVideo.find('#rangeSlider').rangeSlider({ 
            defaultValues: { 
                min: 0, 
                max: max
            },
            bounds: {
                min: 0,
                max: max
            },
            step: 0.005,
            formatter: function(val){
                        var value = moment( new Date ).startOf('day').add( val, 'seconds').format('H:mm:ss.SSS');
                        return value;
                        
                }
         }).bind("valuesChanged", function(e, data){
            var $videoPrincipal = $($contenedorVideo.find('video')[0]);
            var videoPrincipal = $contenedorVideo.find('video')[0];
            var t = '#t='+ data.values.min +',' +  data.values.max;
            var datosPreview = {
                id: $videoPrincipal.attr('id'),
                src: $videoPrincipal.find('source')[0].src + t,
                snapshot: $videoPrincipal.attr('poster')
            };
            // var renderpreview = templateVideoPreview( datosPreview );
            // $contenedorPreview.html(renderpreview);
            $videoPrincipal.find('source').attr('src', t);
            var videoPreview = $contenedorPreview.find('video')[0];
            videoPrincipal.addEventListener('timeupdate', chequearLimitesVideo, false );
            $spanDesde.text(parseFloat(data.values.min).toFixed(3));
            $spanHasta.text(parseFloat(data.values.max).toFixed(3));

            });
            
        $contenedorVideo.find('.js-crear-gif').removeClass('disabled');
        // var videoPrincipal = $contenedorVideo.find('video')[0];
        // videoPrincipal.addEventListener('timeupdate', chequearLimitesVideo, false );
        $forms.hide();
        var valoresDefecto = $contenedorVideo.find('#rangeSlider').rangeSlider('values');
        $contenedorVideo.find('#rangeSlider').rangeSlider('values', 0.000001, valoresDefecto.max);
        
    };

    Dropzone.options.uploaderwm = {
        paramName: "file", // El nombre que se usará como parametro para transferir el archivo
        maxFilesize: 1, // MB
        maxFiles: 1, // cantidad máxima de imagenes a subir
        addRemoveLinks: true,
        acceptedFiles: 'image/jpeg, image/pjpeg, image/png',
        dictRemoveFile: "Borrar",
        dictDefaultMessage: "Arrastre una imagen aquí o haga click para seleccionar (Tamaño máximo 1MB)",
        sending: function(file, xhr, formData){
          formData.append('watermark', $hdnWatermark.val() );
        },
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
                $hdnWatermark.val( '' );
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

    // $galeria.unitegallery();
    $(".animado").jqGifPreview();

    Dropzone.options.uploader = {
            paramName: "file", // El nombre que se usará como parametro para transferir el archivo
            maxFilesize: 10, // MB
            maxFiles: 1, // cantidad máxima de imagenes a subir
            addRemoveLinks: true,
            acceptedFiles: 'video/mp4, video/webm, video/x-matroska',
            dictRemoveFile: "Borrar",
            dictDefaultMessage: "Arrastre un video aquí o haga click para seleccionar (Tamaño máximo 10MB)",
            sending: function(file, xhr, formData){
                $('.espere-procesando').removeClass('hidden');
                formData.append('watermark', $hdnWatermark.val() );
                formData.append('ubicacionWM', $('#ubicacionWM').val() );
            },

            init: function() {
                this.on("sending", function(file) {
                  // $botonEnviar.prop('disabled', true);
                  $('.contenedor-forms').hide();
                  $contenedorVideo.find('.espere').removeClass('hidden');

                });

                this.on( 'complete', function (file, par2){
                  // debugger;
                  // $botonEnviar.prop('disabled', false );
                  $('.espere-procesando').addClass('hidden');
                }),

                
                this.on("maxfilesexceeded", function(file) {
                  alert("Solo se puedem agregar 1 video");
                });

                this.on('removedfile', function(file) {
                 
                });

                this.on("success", function(file, responseText) { 
                  //alert("Success.");
                    onVideoSubido( responseText );
                });

            // Using a closure.
            var _this = this;
          }
          };

        
        function chequearLimitesVideo () {
            var video = this;
            var tiempos = $(video).find('source')[0].src.split('#t=')[1].split(',');
            var desde = parseFloat ( tiempos[0] );
            var hasta = parseFloat ( tiempos[1] );
            $contenedorVideo.find('#tiempoActual').text( moment( new Date ).startOf('day').add( video.currentTime, 'seconds').format('H:mm:ss.SSS') );
            if ( video.currentTime > hasta ) {
                video.currentTime = hasta;
                video.pause();
            }
            if ( video.currentTime < desde ) {
                video.currentTime = desde;
                video.pause();
            }


        }
        
        $contenedorPreview.on('click', '.js-reproducir-preview', function (e){
            e.preventDefault();
            var $video = $('#contenedorPreview').find('video')[0];
            $video.play();
        }).on('click', '.js-pausar-preview', function (e){
            e.preventDefault();
            var $video = $contenedorPreview.find('video')[0];
            $video.pause();
        });

        $contenedorVideo.on( 'click', '.js-crear-gif', function ( e ) {
            e.preventDefault();
            var $target = $(e.currentTarget);

            if ( $target.hasClass('disabled') ) return false;

            var subtitulos = [];
            var subtitulo = {
                desde: moment( new Date ).startOf('day').add( $spanDesde.text( ), 'seconds').format('H:mm:ss.SSS'),
                hasta: moment( new Date ).startOf('day').add( $spanHasta.text( ), 'seconds').format('H:mm:ss.SSS'),
                texto: $('#texto').val(),
                color: 'yellow'
            };
            subtitulos.push( subtitulo );
            var textoSubtitulos = templateSubtitulos( { subtitulos: subtitulos });
            var valoresDefecto = $contenedorVideo.find('#rangeSlider').rangeSlider('values');
            var datos = {
                desde : parseFloat( valoresDefecto.min ),
                hasta : parseFloat( valoresDefecto.max ),
                filename : $video.attr('id'),
                texto: '',
                subtitulos: textoSubtitulos,
                idVideo: $video.attr('id'),
                watermark: $hdnWatermark.val(),
                ubicacionWM: $('#ubicacionWM').val(),
                userKey: $('#hdnUserKey').val()
            };

            
            $.ajax({
                url: '/generar',
                type: 'POST',
                data: datos
            })
            .done(function() {
                $contenedorVideo.find('.js-crear-gif').addClass('disabled');
                Dropzone.forElement("#uploader").removeAllFiles(true);
                $contenedorVideo.html('');
                $contenedorPreview.html('');
                swal("Se ha comenzado con el proceso del video", "Cuando termine estará disponible en la lista de imágenes creadas", "success");
                $forms.show();
            })
            .fail(function( event, jqxhr, settings ) {
                sweetAlert('Se produjo un error', event.responseText, 'error');
            })
            .always(function() {
                console.log("complete");
            });
        });
    $btnInfoYoutube.on('click', function (e) {
        e.preventDefault();
        $('.espere-procesando').removeClass('hidden');
        $.ajax({
            url: '/infoyoutube',
            type: 'GET',
            data: { 
                urlVideo: $urlYotube.val()
            }
        })
        .done(function(data) {
            console.log("success", data);
            var renderInfo = templateYoutube(data);
            $contenedorInfoYoutube.html(renderInfo);
        })
        .fail(function(err) {
            console.log("error", err);
        })
        .always(function() {
            $('.espere-procesando').addClass('hidden');
        });
        
    });
    $contenedorInfoYoutube.on('click', '.js-importar-youtube', function (e) {
        e.preventDefault();
        $contenedorForms.addClass('hidden');
        window.scrollTo(0, 0);
        $('.espere-procesando').removeClass('hidden');
        var datos = {
            urlVideo: $contenedorInfoYoutube.find('#hdnUrlYoutube').val(),
            format: $contenedorInfoYoutube.find('#slFormat').val(),
            watermark: $hdnWatermark.val(),
            ubicacionWM: $('#ubicacionWM').val(),
            userKey: $('#hdnUserKey').val()
        };

        $.ajax({
            url: '/importaryoutube',
            type: 'POST',
            data: datos
        })
        .done(function(data) {
            onVideoSubido(data);
        })
        .fail(function(err) {
            console.log("error", err);
            swal('Error de validación', err.responseText, 'error');
            $contenedorForms.removeClass('hidden');
        })
        .always(function() {
            $('.espere-procesando').addClass('hidden');
        });
        
    });
    
});