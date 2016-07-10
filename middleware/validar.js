'use strict';
exports.checkDatos = function (req, res, next ) {
    var datos = req.body;

    if ( ! datos.filename ) {
        return res.status(409).json('No se seleccionó ningún video');
    }

    if ( ( isNaN( datos.desde ) || isNaN( datos.hasta ) )  || datos.desde > datos.hasta ) {
        return res.status(409).json('Por favor verifique los parámetros de comienzo y fin');
    }
    
    if (  Math.abs( datos.hasta - datos.desde ) > 10 ) {
        return res.status(409).json('El tramo seleccionado no puede durar más de 10 segundos ');
    }

    return next();
}
