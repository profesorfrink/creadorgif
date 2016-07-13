'use strict';

var socket = io();

socket.on('imagenProcesada', function(imagen){
    swal({   
        title: "Éxito",   
        text: "<p>Su imagen se ha terminado de procesar.</p><a href='/imagenes/detalles/"+ imagen._id + "'>Ver Imagen</a>",   
        html: true,
        imageUrl: "/gifs/" + imagen.nombre
    });
});

socket.on('clipCreado', function(video){
    swal({   
        title: "Éxito",   
        text: "<p>El clip se ha creado correctamente.</p><a href='/videos/desde/"+ video._id + "'>Crear gif desde clip</a>",   
        html: true,
        imageUrl: "/images/" + video.screenshot
    });
});