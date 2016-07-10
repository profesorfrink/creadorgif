'use strict';

var socket = io();

socket.on('imagenProcesada', function(imagen){
    swal({   
        title: "Éxito",   
        text: "Su imagen se ha terminado de procesar.",   
        imageUrl: "/gifs/" + imagen.nombre
    });
});