'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var nedb = require('nedb');
const TAM_PAGINA = 10;
var async = require('async');

var dbVideos = new nedb({
    filename: path.join( __dirname, '../db/videos.db'), 
});

/* GET users listing. */
router.get('/', function(req, res, next) {
    dbVideos.loadDatabase();
    var pagina = req.query.pagina || 1;
    var desde = ( pagina - 1) * TAM_PAGINA;
    
    async.parallel([
      function ( done ) {
        dbVideos.find({}).exec( done );
      },
      function ( done ) {
        dbVideos.count({}).exec( done );
      }
      ], function ( err, resultados ) {
        if ( err) {
          return next ( err );
        } else {
          var totalRegistros = resultados[1];
          var totalPaginas = Math.ceil ( totalRegistros / TAM_PAGINA );
          res.render('videos', {
            totalRegistros: totalRegistros,
            totalPaginas: totalPaginas,
            pagina: pagina,
            videos: resultados[0]
          })
        }
    });
        
});

router.get('/desde/:id', function ( req, res, next ) {
  dbVideos.loadDatabase();
  dbVideos.findOne( { _id: req.params.id }).exec( function ( err, video ) {
    if ( err ) {
      return next (err);
    } else {
      var duracion = Math.floor( video.metadata.format.duration );
      res.render('desdevideo', {
        video: video,
        duracion: duracion
      });
    }
  });
});
module.exports = router;
