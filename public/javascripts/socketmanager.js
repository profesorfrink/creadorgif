'use strict';

var socket = io();

socket.on('imagenProcesada', function(imagen){
    swal({   
        title: "Éxito",   
        text: "<p>Su imagen se ha terminado de procesar.</p><a href='/imagenes/"+ imagen._id + "'>Ver Imagen</a>",   
        html: true,
        imageUrl: "/gifs/" + imagen.nombre
    });
});