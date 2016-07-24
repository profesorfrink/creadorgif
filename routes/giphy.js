'use strict';

var express = require('express');
var router = express.Router();
var giphy = require('giphy-api')();
const TAM_PAGINA = 25;
router.get('/search', function ( req, res, next ) {
    var aBuscar = req.query.q;
    var pagina = parseInt(req.query.pagina) || 1
    var parBusqueda = {
        q: aBuscar,
        limit: TAM_PAGINA,
        offset: ( pagina - 1 ) * TAM_PAGINA
    }
    giphy.search( parBusqueda, function(err, data) {
        if ( err ) {
            return next( err );
        } else {
            var paginacion = data.pagination;
            paginacion.pagina = pagina;
            paginacion.totalPaginas = Math.ceil(data.pagination.total_count / TAM_PAGINA);
            paginacion.term = aBuscar;
            res.render('giphy', {
                imagenes: data.data,
                paginacion: paginacion
            });
        }
    });
});

router.get('/trending', function (req, res, next ) {
    giphy.trending(function(err, data) {
        if (err) {
            return next(err);
        } else {

            var paginacion = {
                total_count: 25,
                pagina: 1,
                totalPaginas: 1
            };
            res.render('giphy', {
                imagenes: data.data,
                paginacion: paginacion
            })
        }
    });
});

router.get('/stickers', function (req, res, next ) {
    var aBuscar = 'funny';
    var pagina = parseInt(req.query.pagina) || 1
    var parBusqueda = {
        q: 'funny',
        api: 'stickers',
        limit: TAM_PAGINA,
        offset: ( pagina - 1 ) * TAM_PAGINA
    }
    giphy.search( parBusqueda, function(err, data) {
        if ( err ) {
            return next( err );
        } else {
            var paginacion = data.pagination;
            paginacion.pagina = pagina;
            paginacion.totalPaginas = Math.ceil(data.pagination.total_count / TAM_PAGINA);
            paginacion.term = aBuscar;
            res.render('giphy', {
                imagenes: data.data,
                paginacion: paginacion
            });
        }
    });
})

module.exports = router;