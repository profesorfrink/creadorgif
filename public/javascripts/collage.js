'use strict';
var objetos = [];
var canvasF, canvasFabric;

Handlebars.registerHelper('esTexto', function( index ) {
    if (typeof objetos !== 'undefined') {
        return objetos[index].tipo === 'texto';
    }
  
});
$(document).ready( function () {

    var $video = $('video.js-video-principal');
    var videoPrincipal = document.getElementById( $video.attr('id') );
    var contenedorImagenes = document.getElementById( 'contenedorImagenes');
    var $contenedorImagenes = $('#contenedorImagenes');
    var $modalImagenes = $('#modalImagen');

    var imagenesAgregadas = [];

    var tplListaObjetos = Handlebars.compile( $('#tplListaObjetos').html());    

    /**** Comienzo tomar captura****/
    var contadorImagenes = 0;
    var canvas = document.getElementById('canvas');
    var canvasCollage = document.getElementById('canvasCollage');
    var canvasImagine;
    var ctx = canvas.getContext("2d");

    var videoHeight, videoWidth, heightImagen;
    // var contenedorImagenes = document.getElementById("contenedorImagenes");
    var imageWidth = 320;
    var imageHeight, letfImagen, topImagen;

    var $panel = $('#panelTexto');
    var $texto = $panel.find('.js-texto');
    var $selectFont = $panel.find('.js-font');
    var $size = $panel.find('.js-size');
    var $color = $panel.find('.js-color');

    canvasF = document.getElementById('canvasFabric');
    var canvasImagine = new imagine.Canvas('canvasCollage');

    canvasFabric = this.__canvas = new fabric.Canvas('canvasFabric', {stateful: false});

    canvasFabric.on({
        'object:selected': selectedObject
    });
    function selectedObject(e) {
        var id = canvasFabric.getObjects().indexOf(e.target);
    }

    videoPrincipal.addEventListener('loadedmetadata', inicializarMetadata);

    function inicializarMetadata () {
        videoHeight = videoPrincipal.videoHeight; 
        videoWidth = videoPrincipal.videoWidth;
        canvas.width = videoWidth;
        canvas.height = videoHeight;
       
    }
    $('.js-snapshot').click( function ( e ) {
        e.preventDefault();
        ctx.drawImage(videoPrincipal, 0, 0, videoWidth, videoHeight);
        var img = new Image();
        img.src = canvas.toDataURL();
        
        img.width = imageWidth;
        img.className += "col-xs-2";
        contenedorImagenes.appendChild(img);
   
    } );

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
                   
                    fabric.Image.fromURL( img.src, function(image) {
                    image.set({
                        left: 0,
                        top: 0,
                        angle: 0
                    });
                    canvasFabric.add(image);
                    canvasFabric.getActiveObject(image);
                    var imagen = {
                        id: canvasFabric.getObjects().indexOf(image),
                        src: image._originalElement.src,
                        orden: canvasFabric.getObjects().indexOf(image)
                    };
                    var objeto = {
                        tipo: 'imagen',
                        src: image.src,
                        orden: canvasFabric.getObjects().indexOf(image)
                    }
                    objetos.push(objeto);
                    dibujarTemplateObjetos();
                    imagenesAgregadas.push(image);
                    
                    $modalImagenes.modal('hide');

                    });
                    
                });

            // Using a closure.
            var _this = this;
          }
    };

    var onClickImageContenedor = function (e) {
        e.preventDefault();

        if ( e.which === 2 ) {
            $(this).remove();
        }
    };

    $contenedorImagenes.on('mousedown', 'img', onClickImageContenedor);

    var onClickGenerarCollage = function ( e ) {
        e.preventDefault();
        videoPrincipal.pause();
        var imagenes = $contenedorImagenes.find('img');
        var contadorImagenes = imagenes.length;
        var filas = Math.ceil(contadorImagenes / 2);

        if ( contadorImagenes > 0 ) {
            imageWidth = imagenes[0].naturalWidth;
            imageHeight = imagenes[0].naturalHeight;
            
            if ( imageWidth > 320 ) {
                var originalWidth = parseInt(imageWidth);
                imageWidth = 320;
                imageHeight = parseInt(imageHeight * 320 / originalWidth);
            }

            canvasCollage.width = imageWidth * 2;
            canvasCollage.height = imageHeight * filas;

            canvasF.width = imageWidth * 2;
            canvasF.height = imageHeight * filas;

            canvasFabric.setHeight(canvasF.height);
            canvasFabric.setWidth(canvasF.width);

            imagenes.each( function (idx, val ) {
                var fila = Math.floor( idx / 2);
                var left = ( idx % 2 === 0 ) ? 0 : imageWidth;
                var top = fila * imageHeight;

                var img = new Image();
                img.src = val.src;

                img.addEventListener('load', function() {

                    fabric.Image.fromURL( val.src, function(image) {
                        image.set({
                            left: left,
                            top: top,
                            angle: 0,
                            width: imageWidth,
                            height: imageHeight,
                            hasBorders: false,
                            hasControls: false,
                            hasRotatingPoint: false,
                            lockMovementX: true,
                            lockMovementY: true,
                            selectable: false
                        });
                        canvasFabric.add(image);
                        
                        canvasFabric.setActiveObject(image);
                    });

                }, false);
                canvasFabric.renderAll();
                $contenedorImagenes.html('');
                $contenedorImagenes.hide();
                $panel.removeClass('hidden');

            });
            
        }
        $('.row.video').hide();
    }

    function DownloadImage() {
       
        try {
            //canvasFabric.setActiveObject( canvasFabric.getObjects()[0]);
            var rawImageData = canvasF.toDataURL('image/jpeg', 0.76);
            rawImageData = rawImageData.replace('image/jpeg', 'image/octet-stream');
            var link = document.createElement('a');
            link.download = 'collage.jpg';
            link.href = rawImageData;
            link.click();
            
        }
        catch (err) {
            
            alert("Sorry, can't download");
        }

        return true;
    }

    var onClickGuardarImagen = function (e) {
        e.preventDefault();
        DownloadImage();
    }
    
    var onClickAgregarTexto = function (e ) {
        e.preventDefault();
        var top = parseInt( imageHeight / 2 );
        var left = parseInt( imageWidth / 2 );
       

        var textFabric = new fabric.Text($texto.val(), {
            left: left,
            top: top,
            
            fontFamily: $selectFont.val(),
            fontSize: 28,
            fontWeight: 'bold',
            fill: $color.val(),
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            strokeWidth: Math.floor( parseInt($size.val()) / 16 ),
            stroke: '#000'
        });
        canvasFabric.add( textFabric );
        var objeto = {
            tipo: 'texto',
            texto: $texto.val(),
            orden: canvasFabric.getObjects().indexOf(textFabric)
        };
        canvasFabric.renderAll();
        canvasFabric.bringToFront(textFabric)
        dibujarTemplateObjetos();
        
    }

    var onClickSeleccionarImagen = function (e) {
        e.preventDefault();
        var url = $('.js-url-imagen').val();
        var spinner = $modalImagenes.find('.espere');
        spinner.removeClass('hidden');

        $.ajax({
            url: '/videos/desdeurl',
            type: 'POST',
            
            data: { url: url }
        })
        .done(function(data) {

            fabric.Image.fromURL( '/images/' + data , function(image) {
                // image.crossOrigin = 'Anonymous';
                image.set({
                    left: 0,
                    top: 0,
                    angle: 0
                });
                canvasFabric.add(image);
                canvasFabric.getActiveObject(image);
                var imagen = {
                    id: canvasFabric.getObjects().indexOf(image),
                    src: image._originalElement.src,
                    orden: canvasFabric.getObjects().indexOf(image)
                };
                imagenesAgregadas.push(image);
                objetos.push(imagen);
                dibujarTemplateObjetos();
                $modalImagenes.modal('hide');
            });

        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            spinner.addClass('hidden');
        });
        

        
    }

    function testImage(url, callback, timeout) {
        timeout = timeout || 5000;
        var timedOut = false, timer;
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onerror = img.onabort = function() {
            if (!timedOut) {
                clearTimeout(timer);
                callback(url, "error");
            }
        };
        img.onload = function() {
            if (!timedOut) {
                clearTimeout(timer);
                callback(url, "success");
            }
        };
        img.src = url;
        timer = setTimeout(function() {
            timedOut = true;
            callback(url, "timeout");
        }, timeout); 
    }

    var onClickClone = function (e ) {
        e.preventDefault();
        var $target = $(e.currentTarget);
        var orden = parseInt( $target.data('index'));
        //var seleccionado = canvasFabric.setActiveObject( canvasFabric.getObjects()[orden] );
        var object = fabric.util.object.clone( canvasFabric.getObjects()[orden]  );
        object.set('top', object.top+5);
        object.set('left', object.left+5);
        canvasFabric.add(object);
        canvasFabric.renderAll();
        dibujarTemplateObjetos();
    }

    $('#contenedorListaObjetos').on('click', '.js-flip-x', function(e) {
        e.preventDefault();
        var $target = $(e.currentTarget);
        var orden = parseInt( $target.data('index'));
        var objetoSeleccionado = canvasFabric.getObjects()[orden];
        var valorActual = objetoSeleccionado.get('flipX');
        objetoSeleccionado.set('flipX', !valorActual);
        canvasFabric.renderAll();
    }).on('click', '.js-flip-y', function(e) {
        e.preventDefault();
        var $target = $(e.currentTarget);
        var orden = parseInt( $target.data('index'));
        var objetoSeleccionado = canvasFabric.getObjects()[orden];
        var valorActual = objetoSeleccionado.get('flipY');
        objetoSeleccionado.set('flipY', !valorActual);
        canvasFabric.renderAll();
    }).on('click', '.js-seleccionar-objeto', function(e) {
        e.preventDefault();
        var $target = $(e.currentTarget);
        var orden = parseInt( $target.data('index'));
        canvasFabric.setActiveObject( canvasFabric.getObjects()[orden] );
    }).on('click', '.js-eliminar-objeto', function(e) {
        e.preventDefault();
        var $target = $(e.currentTarget);
        var orden = parseInt( $target.data('index'));
        var idx = parseInt( $target.data('idx'));
        canvasFabric.setActiveObject( canvasFabric.getObjects()[orden] );
        canvasFabric.getActiveObject().remove();
        objetos.splice(idx, 1);
        dibujarTemplateObjetos();
    }).on('change', '.js-cambiar-opacidad', function(e) {
        e.preventDefault();
        var $target = $(e.currentTarget);
        var orden = parseInt( $target.data('index'));
        
        //var objetoSeleccionado = canvasFabric.setActiveObject( canvasFabric.getObjects()[orden] );
        canvasFabric.getObjects()[orden].set({ opacity: parseFloat(e.target.value) })
        canvasFabric.renderAll();
        
    }).on('click', '.js-clone', onClickClone);
    
    // window.onkeydown = onKeyDownHandler;

    // function onKeyDownHandler(e) {
    //     switch (e.keyCode) {
    //         case 46: // delete
    //             canvasFabric.getActiveObject().remove();
    //             return;
    //     }
    // }


    function dibujarTemplateObjetos() {
        var render = tplListaObjetos( { objetos: canvasFabric.getObjects() });
        $('#contenedorListaObjetos').html(render);
    }
    $contenedorImagenes.on("render", function() {
        dibujarTemplateObjetos();
    });
    $('.js-generar-collage').click( onClickGenerarCollage);
    $('.js-agregar-texto').click( onClickAgregarTexto );
    $('.js-guardar').click( onClickGuardarImagen);
    $('.js-usar-imagen').click( onClickSeleccionarImagen);
    
});

