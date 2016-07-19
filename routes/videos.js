'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var nedb = require('nedb');
const TAM_PAGINA = 10;
var async = require('async');
var moment = require('moment');
var ffmpeg = require('fluent-ffmpeg');
var kue = require('kue');
var uuid = require('uuid');
var jobs = kue.createQueue();
var fs = require('fs');
var request = require('request');

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
        dbVideos.find({}).skip(desde).limit(TAM_PAGINA).sort({ fechaInsert: -1 }).exec( done );
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

router.post('/crearclip', function ( req, res, next ) {
  var datos = req.body;
  var nombreArchivoSalida = uuid.v4() + '.mp4';

  var pathVideos = path.join( __dirname, '../public/videos/')
  
  var pathArchivoInput = pathVideos + datos.nombreArchivo;
  var pathArchivoOutput = pathVideos + nombreArchivoSalida;

  var jobData = {
      input: pathArchivoInput,
      output: pathArchivoOutput,
      desde: parseFloat(datos.desde),
      hasta: parseFloat(datos.hasta),
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
  };

  if ( datos.watermark.trim() !== 0 ) {
    jobData.watermark = datos.watermark;
    jobData.ubicacionWM = datos.ubicacion;
  }
  var job = jobs.create('crearClip', jobData );

  job.on('complete',  function ( clip  ) {
      res.app.emit('clipCreado', clip, req.headers['x-forwarded-for'] || req.connection.remoteAddress );
  });

  job.save( function (err ) {
      if ( err ) {
          return next ( err );
      } else {
          res.status(200).json('ok');
      }
  });

});

router.get('/collage/:id', function ( req, res, next ) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  dbVideos.loadDatabase();
  dbVideos.findOne( { _id: req.params.id }).exec( function ( err, video ) {
    if ( err ) {
      return next (err);
    } else {
      //var duracion = Math.ceil( video.duracion );
      
      res.render('collage', {
        video: video
      });
    }
  });
});
router.get('/desde/:id', function ( req, res, next ) {
  dbVideos.loadDatabase();
  dbVideos.findOne( { _id: req.params.id }).exec( function ( err, video ) {
    if ( err ) {
      return next (err);
    } else {
      //var duracion = Math.ceil( video.duracion );
      var hasta = moment( new Date ).startOf('day').add( video.duracion, 'seconds'  ).format('H:mm:ss.SSS');
      res.render('desdevideo', {
        video: video,
        duracion: video.duracion,
        hasta: hasta
      });
    }
  });
});

var download = function(uri, filename, callback){
  
  request.head(uri, function(err, res, body){
    var headers = res.headers['content-type'];
    var lentgth = res.headers['content-length'];
    console.log('content-type:', headers );
    console.log('content-length:',  lentgth);
    var nombreArchivo =  path.join(__dirname , '../public/images/'  + filename + '.' + path.extname( uri ) ) ;

    request(uri).pipe( fs.createWriteStream( nombreArchivo ).on('close', function() {
      return callback( null, nombreArchivo);
    }));
  });
};

router.post('/desdeurl', function (req, res, next ) {
  var archivo = req.body.url;

  download( archivo, uuid.v4(), function (err, pathArchivoGenerado ) {
    if ( err ) {
      return next (err);
    } else {
      res.status(200).json( path.basename( pathArchivoGenerado )); 
    }
  });
});



module.exports = router;
