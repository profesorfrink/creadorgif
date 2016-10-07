'use strict';
var objetos = [];
var canvasF, canvasFabric, f;


$(document).ready( function () {

    var $video = $('video.js-video-principal');
    var videoPrincipal = document.getElementById( $video.attr('id') );
    var contenedorImagenes = document.getElementById( 'contenedorImagenes');
    var $contenedorImagenes = $('#contenedorImagenes');
    var $contenedorDialog = $('#contenedorDialog');
    var $modalImagenes = $('#modalImagen');

    var imagenesAgregadas = [];

    var tplListaObjetos = Handlebars.compile( $('#tplListaObjetos').html());
    var tplDialogPropiedades = Handlebars.compile( $('#tplDialogPropiedades').html());

    /**** Comienzo tomar captura****/
    var contadorImagenes = 0;
    var canvas = document.getElementById('canvas');
    var canvasCollage = document.getElementById('canvasCollage');
    
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

    var filters = [ 'grayscale', 'invert', 'remove-white', 'sepia', 'sepia2',
                    'brightness', 'noise', 'gradient-transparency', 'pixelate',
                    'blur', 'sharpen', 'emboss', 'tint', 'multiply', 'blend'];

    canvasFabric = this.__canvas = new fabric.Canvas('canvasFabric', {stateful: false});
    f = fabric.Image.filters;
    canvasFabric.on({
        'object:selected': selectedObject,
        'selection:cleared': clearedSelection
    });
    function clearedSelection (e) {
        if (!e.e) return;

        $contenedorDialog.dialog('destroy');
    }
    function selectedObject(e) {
        
        if ( ! e.e ) return;

        var id = canvasFabric.getObjects().indexOf(e.target);
        //var dialog = tplDialogPropiedades(e.target);
        $contenedorDialog.html( tplDialogPropiedades(e.target) );
        $contenedorDialog.find('input.slider').bootstrapSlider()
        var w = e.target.width;
        
        var finObjetoX =  e.target.width + e.target.left;

        var my;
        if ( finObjetoX > (canvasFabric.width  / 2 )) {
            my = 'left center';
        } else {
            my = 'right center'
        }
        
        $contenedorDialog.dialog({
            position: { at: my , of : '#canvasFabric' }
        });
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
            fontSize: parseInt($panel.find('.js-font-size').val()),
            fontWeight: parseInt($panel.find('.js-font-weight').val()),
            fill: $color.val(),
            textAlign: $panel.find('.js-label-align').attr('data-align'),
            backgroundColor: 'rgba(0,0,0,0.5)',
            //strokeWidth: Math.floor( parseInt($size.val()) / 16 ),
            strokeWidth: 1,
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
            url: '/v/desdeurl',
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
    
    function applyFilter(index, filter) {
        var obj = canvasFabric.getActiveObject();
        obj.filters[index] = filter;
        obj.applyFilters(canvasFabric.renderAll.bind(canvasFabric));
    }

    $contenedorDialog.on('change', '.js-slider-opacidad', function (e) {
        canvasFabric.getActiveObject().set( {
            opacity: parseFloat( e.value.newValue )
        });
        canvasFabric.renderAll();
    })
    .on('change', '.js-slider-outline', function(e) {
        canvasFabric.getActiveObject().set( {
            strokeWidth: parseFloat( e.value.newValue )
        });
        canvasFabric.renderAll();
    })
    .on('change', '.js-color', function(e) {
        var colorNuevo = e.target.value;
        canvasFabric.getActiveObject().set( {
            fill: colorNuevo
        });
        canvasFabric.renderAll();
    })
    .on('click', '.js-clone', function (e) {
        e.preventDefault();
        var object = fabric.util.object.clone( canvasFabric.getActiveObject() );
        //object.set('top', object.top + 5);
        //object.set('left', object.left + 5);
        object.set({
            lockMovementX: false,
            lockMovementY: false,
            top: object.top + 5,
            left: object.left + 5
        });
    
        
                            
        canvasFabric.add(object);
        canvasFabric.renderAll();
    })
    .on('click','#grayscale', function(e) {
        applyFilter(0, this.checked && new f.Grayscale());
    })
    .on('click','#invert', function(e) {
        applyFilter(1, this.checked && new f.Invert());
    })
    .on('click','#sepia', function(e) {
        applyFilter(2, this.checked && new f.Sepia());
    })
    .on('click','#sepia2', function(e) {
        applyFilter(3, this.checked && new f.Sepia2());
    })
    .on('click','#emboss', function(e) {
        applyFilter(11, this.checked && new f.Convolute({
        matrix: [   1,   1,  1,
                    1, 0.7, -1,
                    -1,  -1, -1 ]
        }));
    })
    .on('click','#sharpen', function(e) {
        applyFilter(10, this.checked && new f.Convolute({
        matrix: [  0, -1,  0,
                    -1,  5, -1,
                    0, -1,  0 ]
        }));
    })
    .on('click','#blur', function(e) {
        applyFilter(9, this.checked && new f.Convolute({
        matrix: [ 1/9, 1/9, 1/9,
                  1/9, 1/9, 1/9,
                  1/9, 1/9, 1/9 ]
        }));
    })
    .on('click', '.js-cambiar-texto', function (e) {
        e.preventDefault();
        var nuevoTexto = $contenedorDialog.find('.js-texto-nuevo').val();
        canvasFabric.getActiveObject().set({
            text: nuevoTexto
        });
        canvasFabric.renderAll();
    })
    .on('click', '.js-align button', function(e) {
        e.preventDefault();
        var $target = $(e.currentTarget);
        canvasFabric.getActiveObject().set({
            textAlign: $target.attr('data-align')
        });
        canvasFabric.renderAll();
    })
    .on('change', '.js-font', function(e) {
        var newFont = e.target.value;
        canvasFabric.getActiveObject().set({
            fontFamily: newFont
        });
        canvasFabric.renderAll();

    })
    .on('change', '.js-font-size', function(e) {
        var newSize = e.target.value;
        canvasFabric.getActiveObject().set({
            fontSize: parseInt(newSize)
        });
        canvasFabric.renderAll();
    })
    .on('change', '.js-font-weight', function(e) {
        var newWeight = e.target.value;
        canvasFabric.getActiveObject().set({
            fontWeight: parseFloat(newWeight)
        });
        canvasFabric.renderAll();
    })
    .on('change', '.js-line-height', function(e) {
        var newHeight = e.target.value;
        canvasFabric.getActiveObject().set({
            lineHeight: parseFloat(newHeight)
        });
        canvasFabric.renderAll();
    }).on('click', '.js-front', function(e) {
        e.preventDefault();
        canvasFabric.bringToFront(canvasFabric.getActiveObject());
        canvasFabric.renderAll();
    })
    .on('click', '.js-back', function(e) {
        e.preventDefault();
        canvasFabric.sendToBack(canvasFabric.getActiveObject());
        canvasFabric.renderAll();
    });
    
    $panel.on('click', '.js-align button', function(e) {
        e.preventDefault();
        var $target = $(e.currentTarget);
        var $label = $panel.find('.js-label-align');
        $label.text( $target.data('label'));
        $label.attr('data-align', $target.data('align'));
    });
    

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

