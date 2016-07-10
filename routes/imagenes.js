'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var nedb = require('nedb');
const TAM_PAGINA = 10;
var async = require('async');

var db = new nedb({
    filename: path.join( __dirname, '../db/imagenes.db'), 
});

router.get('/', function(req, res, next) {
     db.loadDatabase( function (err) { 
        var pagina = req.query.pagina || 1;
        var desde = ( pagina - 1) * TAM_PAGINA;
        async.parallel( [
            function ( done ) {
                db.find({}).limit(TAM_PAGINA).skip(desde).sort( { nombre: -1 }).exec( done );
            },
            function ( done ) {
                db.count({}).exec( done );
            }
            ], function ( err, resultados ) {
                if ( err ) {
                    return next ( err );
                } else {
                    var totalRegistros = resultados[1];
                    var totalPaginas = Math.ceil ( totalRegistros / TAM_PAGINA );
                    res.render('imagenes', {
                        totalRegistros: totalRegistros,
                        totalPaginas: totalPaginas,
                        pagina: pagina,
                        imagenes: resultados[0]
                    });
                }
        });
    });
});

router.get('/:id', function ( req, res, next ) {
    db.loadDatabase( function (err) { 
        db.findOne( { _id: req.params.id }).exec( function (err, imagen ) {
            if ( err ) {
                return next (err);
            } else {
                imagen.pathVideo = '/videos/' + path.basename(imagen.video);
                res.render('imagen', {
                    imagen: imagen
                });
            }
        });
    });
});

module.exports = router;
