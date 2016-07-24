'use strict';

$(document).ready( function () {
    var socket = io();
    
    var room = $('#hdnUserKey').val();
    console.log ( 'room ' + room );
    socket.emit('room', room );

    socket.on('imagenProcesada', function(imagen){
        swal({   
            title: "Éxito",   
            text: "<p>Su imagen se ha terminado de procesar.</p><a href='/i/detalles/"+ imagen._id + "'>Ver Imagen</a>",   
            html: true,
            imageUrl: "/gifs/" + imagen.nombre
        });
    });

    socket.on('clipCreado', function(video){
        swal({   
            title: "Éxito",   
            text: "<p>El clip se ha creado correctamente.</p><a href='/v/desde/"+ video._id + "'>Crear gif desde clip</a>",   
            html: true,
            imageUrl: "/images/" + video.screenshot
        });
    });

    
});
