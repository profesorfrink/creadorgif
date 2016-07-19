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
    var $video;
    var $hdnWatermark = $('#hdnWatermark');
    var $espere = $('.espere');
    // var $galeria = $('#galeria');
    var $botonCrear = $('.js-crear-gif');

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
                $espere.removeClass('hidden');
                formData.append('watermark', $hdnWatermark.val() );
            },

            init: function() {
                this.on("sending", function(file) {
                  // $botonEnviar.prop('disabled', true);

                });

                this.on( 'complete', function (file, par2){
                  // debugger;
                  // $botonEnviar.prop('disabled', false );
                }),

                
                this.on("maxfilesexceeded", function(file) {
                  alert("Solo se puedem agregar 1 video");
                });

                this.on('removedfile', function(file) {
                 
                });

                this.on("success", function(file, responseText) { 
                  //alert("Success.");
                    $espere.addClass('hidden');
                    var $details = $('.dz-details');
                    var datosRender = {
                        filename: responseText.nombre,
                        metadata: responseText.metadata,
                        snapshot: responseText.screenshot,
                        src: responseText.nombre,
                        id: responseText._id
                    };
                    var render = templateVideo( datosRender);
                    $('#contenedorVideo').html(render);

                    //var renderPreview = templateVideoPreview(datosRender);
                    //$('#contenedorPreview').html( renderPreview );

                    $video = $(render);
                    var max = parseFloat(responseText.metadata.duration);

                    $('#desde').text(0);
                    $('#hasta').text(max);

                    $('#rangeSlider').rangeSlider({ 
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
                        var $videoPrincipal = $('#contenedorVideo').find('video');
                        var t = '#t='+ data.values.min +',' +  data.values.max;
                        var datosPreview = {
                            id: $videoPrincipal.attr('id'),
                            src: $videoPrincipal.find('source')[0].src + t,
                            snapshot: $videoPrincipal.attr('poster')
                        };
                        var renderpreview = templateVideoPreview( datosPreview );
                        $('#contenedorPreview').html(renderpreview);

                        var videoPreview = $('#contenedorPreview').find('video')[0];
                        videoPreview.addEventListener('timeupdate', chequearLimitesVideo, false );
                        $('#desde').text(parseFloat(data.values.min).toFixed(3));
                        $('#hasta').text(parseFloat(data.values.max).toFixed(3));
                        });

                    $botonCrear.removeClass('disabled');
                });

            // Using a closure.
            var _this = this;
          }
          };

        function chequearLimitesVideo () {
            var video = $('#contenedorPreview').find('video')[0];
            var tiempos = $(video).find('source')[0].src.split('#t=')[1].split(',');
            var desde = parseFloat ( tiempos[0] );
            var hasta = parseFloat ( tiempos[1] );
            $('#tiempoActual').text( moment( new Date ).startOf('day').add( video.currentTime, 'seconds').format('H:mm:ss.SSS') );
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

        $('body').on( 'click', '.js-crear-gif', function ( e ) {
            e.preventDefault();
            var $target = $(e.currentTarget);

            if ( $target.hasClass('disabled') ) return false;

            var subtitulos = [];
            var subtitulo = {
                desde: moment( new Date ).startOf('day').add( $('#desde').text( ), 'seconds').format('H:mm:ss.SSS'),
                hasta: moment( new Date ).startOf('day').add( $('#hasta').text( ), 'seconds').format('H:mm:ss.SSS'),
                texto: $('#texto').val(),
                color: 'yellow'
            };
            subtitulos.push( subtitulo );
            var textoSubtitulos = templateSubtitulos( { subtitulos: subtitulos });
           
            var datos = {
                desde : parseInt( $('#desde').text( ) ),
                hasta : parseInt( $('#hasta').text() ),
                filename : $video.attr('id'),
                texto: '',
                subtitulos: textoSubtitulos,
                idVideo: $video.attr('id'),
                watermark: $hdnWatermark.val()
            };

            
            $.ajax({
                url: '/generar',
                type: 'POST',
                data: datos
            })
            .done(function() {
                $botonCrear.addClass('disabled');
                Dropzone.forElement("#uploader").removeAllFiles(true);
                $('#contenedorVideo').html('');
                $('#contenedorPreview').html('');
                swal("Se ha comenzado con el proceso del video", "Cuando termine estará disponible en la lista de imágenes creadas", "success")
            })
            .fail(function( event, jqxhr, settings ) {
                sweetAlert('Se produjo un error', event.responseText, 'error');
            })
            .always(function() {
                console.log("complete");
            });
            

        });

          
});