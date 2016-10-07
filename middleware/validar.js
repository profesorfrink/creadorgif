'use strict';
exports.checkDatos = function (req, res, next ) {
    var datos = req.body;

   
    if ( ( isNaN( datos.desde ) || isNaN( datos.hasta ) )  || parseFloat(datos.desde) > parseFloat(datos.hasta) ) {
        return res.status(409).json('Por favor verifique los parámetros de comienzo y fin');
    }
    
    if (  Math.abs( datos.hasta - datos.desde ) > 600 ) {
        return res.status(409).json('El tramo seleccionado no puede durar más de 60 segundos ');
    }

    return next();
}
