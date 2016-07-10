'use script';



$(document).ready( function () {
    var templateVideo = Handlebars.compile( $('#tplVideo').html() );
    var templateVideoPreview = Handlebars.compile( $('#tplVideoPreview').html() );
    var templateImage = Handlebars.compile( $('#tplImagen').html() );
    var $video;
    var $galeria = $('#galeria');
    var $botonCrear = $('.js-crear-gif');

        

    $galeria.unitegallery();
    

    Dropzone.options.uploader = {
            paramName: "file", // El nombre que se usará como parametro para transferir el archivo
            maxFilesize: 10, // MB
            maxFiles: 1, // cantidad máxima de imagenes a subir
            addRemoveLinks: true,
            acceptedFiles: 'video/mp4, video/webm, video/x-matroska',
            dictRemoveFile: "Borrar",
            dictDefaultMessage: "Arrastre un video aquí o haga click para seleccionar (Tamaño máximo 10MB)",
            sending: function(file, xhr, formData){
              formData.append('aa', 'aaaa');
            },

            init: function() {
                this.on("sending", function(file) {
                  // $botonEnviar.prop('disabled', true);

                });

                this.on( 'complete', function (file, par2){
                  // debugger;
                  // $botonEnviar.prop('disabled', false );
                }),

                /*this.on("addedfile", function(file) { 
                  alert("Added file.");
                  console.log("file", file); 
                });*/
                this.on("maxfilesexceeded", function(file) {
                  alert("Solo se puedem agregar 1 video");
                });

                this.on('removedfile', function(file) {
                  
                  // var idFoto = $(file.previewElement).find('.hdnId').val();
                  
                  // db.remove({ 'nombre' : idFoto }, { multi: false }, function(err, numRemoved) {
                  //   console.log(numRemoved);
                  // });
                  // dbFotos({ 'nombre' : idFoto }).remove();
                });

                this.on("success", function(file, responseText) { 
                  //alert("Success.");
                  var $details = $('.dz-details');
                             
                  //$preview = $(file.previewElement);
                  // $preview.append("<a href='#' class='btn btn-default btn-block js-datos-imagen'>Datos imagen</a>");
                  //$preview.append("<input type='hidden' class='hdnId' value='" + responseText.filename +".jpg' />");
                  var video = {
                    nombreCliente: file.name,
                    nombreServidor: responseText.filename,
                    descripcion: ''
                  };
                  var metadata = JSON.stringify(responseText.metadata);
                  //$preview.append(  "<a class='btn btn-success btn-block js-seleccionar'  data-video='"+ responseText.filename + "' data-metadata='" + metadata +" '>Seleccionar</a> " );


                
                var render = templateVideo( {
                    filename: responseText.filename,
                    metadata: metadata,
                    snapshot: responseText.screenshot,
                    src: responseText.filename
                });
                $('#contenedorVideo').html(render);

                $video = $(render);
                
                var idRange = 'range-' + responseText.filename;
                var connectSlider = document.getElementById(idRange);
                var fin = Math.ceil(responseText.metadata.duration);
                noUiSlider.create(connectSlider, {
                    start: [0, fin],
                    connect: false,
                    step: 1,
                    range: {
                        'min': 0,
                        'max': fin
                    }
                });

                connectSlider.noUiSlider.on('update', onUpdateRange);
                $botonCrear.removeClass('disabled');
                });

            // Using a closure.
            var _this = this;
          }
          };

          var onUpdateRange = function( values, handle, a, b, handlePositions ) {

                var offset = handlePositions[handle];

                // Right offset is 100% - left offset
                if ( handle === 1 ) {
                    offset = 100 - offset;
                }

                var desde = values[0];
                var hasta = values[1]; 

                $('#desde').text( desde);
                $('#hasta').text( hasta);
                var idVideo = $video.attr('id');
                var $source = $video.find('source')[0];
                var src = $source.src;
                var t = '#t='+ parseInt(desde) +',' + parseInt(hasta) ;

                var datos = {
                    filename:  idVideo,
                    snapshot: $video.attr('poster').replace(/^.*[\\\/]/, ''),
                    src: idVideo + t
                };

                var render = templateVideoPreview(datos);
                $('#contenedorPreview').html( render );

                
          };

        $('body').on( 'click', '.js-crear-gif', function ( e ) {
            e.preventDefault();
            var $target = $(e.currentTarget);

            if ( $target.hasClass('disabled') ) return false;
            
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