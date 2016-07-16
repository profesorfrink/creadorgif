'use strict';
var canvasImagine, activo; 
$(document).ready( function () {
    var canvas = document.getElementById('canvas');
    canvasImagine = new imagine.Canvas('canvas');

    var $panel = $('#panelTexto');
    var $texto = $panel.find('.js-texto');
    var $selectFont = $panel.find('.js-font');
    var $size = $panel.find('.js-size');
    var $color = $panel.find('.js-color');

     

    $('.js-agregar-texto').click(function (e) {
        e.preventDefault();
        var text = new imagine.Text({
            fontSize: parseInt($size.val()),
            font: $selectFont.val(),
            left: parseInt( canvas.width / 2 ),
            top: parseInt( canvas.height / 2 ),
            text: $texto.val(),
            fill: 'yellow'
        });

        text.on('mouseup', function (e, evt) {
            switch( evt.event.button ) {
                case 0:
                    $('.js-cambiar-tam').val(this.options.fontSize);
                    activo = this;
                    break;
                case 1:
                    // this.set({
                    //     'text': ''
                    // });
                    // this.isActive = false;
                    // return false;
                    canvasImagine.remove(this);
                    activo = false;
                    break;

            }
            
        });
        canvasImagine.add(text);
    });

    var onCambiarTexto = function (e) {
        // var texto = canvasImagine.getActiveObject();
        activo.set({
            fontSize: parseInt(this.value)
        });
        canvasImagine.reDrawObjects();
        canvasImagine.setActiveObject(activo);
    }
    Dropzone.options.uploader = {
            paramName: "file", // El nombre que se usará como parametro para transferir el archivo
            maxFilesize: 1, // MB
            maxFiles: 1, // cantidad máxima de imagenes a subir
            addRemoveLinks: true,
            acceptedFiles: 'image/jpeg, image/pjpeg, image/png',
            dictRemoveFile: "Borrar",
            dictDefaultMessage: "Arrastre una imagen aquí o haga click para seleccionar (Tamaño máximo 1MB)",
            sending: function(file, xhr, formData){
              
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
                 
                });

                this.on("success", function(file, responseText) { 
                  //alert("Success.");
                    $panel.removeClass('hidden');
                    var $details = $('.dz-details');
                    var img = new Image();
                    img.src = '/images/' + responseText.filename + '.jpg';
                   
                    img.addEventListener('load', function() {
                         canvas.width = img.width;
                        canvas.height = img.height;
                        var imgCanvas = new imagine.Image(img, {
                            left: 0,
                            top: 0,
                            width: img.width,
                            height: img.height
                        });
                        canvasImagine.add(imgCanvas);
                    });
                    
                });

            // Using a closure.
            var _this = this;
          }
    };
    $('.js-cambiar-tam').change( onCambiarTexto );
})