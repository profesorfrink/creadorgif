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
var paths = require('../paths');
var parser = require('subtitles-parser');

var dbVideos = new nedb({
    filename: path.join( __dirname, '../db/videos.db'), 
});
var dbImagenes = new nedb({
    filename: path.join( __dirname, '../db/imagenes.db'), 
});

var dbAssets = new nedb({
  filename: paths.dbAssets
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
      ip: datos.userKey
  };

  if ( datos.watermark.trim() !== 0 ) {
    jobData.watermark = datos.watermark;
    jobData.ubicacionWM = datos.ubicacion;
  }
  var job = jobs.create('crearClip', jobData );

  job.on('complete',  function ( clip  ) {
      res.app.emit('clipCreado', clip, datos.userKey );
  });

  job.save( function (err ) {
      if ( err ) {
          return next ( err );
      } else {
          res.status(200).json('ok');
      }
  });

});

router.post('/getsub', function (req, res, next ) {
  fs.readFile( path.join( paths.subtitulos, req.body.sub ),'utf-8', function (err, contenido ) {
    if ( err ) {
      return next(err);
    } else {
      var data = parser.fromSrt(contenido);
      res.status(200).json(data);
    }
  });
});
router.get('/collage/:id', function ( req, res, next ) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  dbVideos.loadDatabase();
  dbAssets.loadDatabase();

  async.parallel([
    function ( done ) {
      dbVideos.findOne( { _id: req.params.id }).exec( done );
    },
    function ( done ) {
      dbAssets.find({}).limit(100).exec( done );
    }
    ], function ( err, resultados ) {
      if ( err ) {
        return next (err);
      }
      var video = resultados[0];
      var assets = resultados[1];

      res.render('collage', {
        video: video, 
        assets: assets
      });

  });
  // dbVideos.findOne( { _id: req.params.id }).exec( function ( err, video ) {
  //   if ( err ) {
  //     return next (err);
  //   } else {
  //     //var duracion = Math.ceil( video.duracion );
      
  //     res.render('collage', {
  //       video: video
  //     });
  //   }
  // });
});


router.get('/desde/:id', function ( req, res, next ) {
  
  dbVideos.loadDatabase();
  dbImagenes.loadDatabase();
  dbAssets.loadDatabase();  
  
  async.parallel([
      function (done) {
        dbVideos.findOne( { _id: req.params.id }).exec( done);
      },
      function (done ) {

        var idImagen = req.query.imagen || '';
        dbImagenes.findOne( { _id: idImagen }).exec( done );        
        
      },
      function ( done ) {
        dbAssets.find({}).exec( done );

      }
    ], function (err, resultados) {
        if (err) {
          return next (err);
        } else {
          
          var video = resultados[0];
          var imagen = resultados[1];
          var subtitulo;

          if ( !video && !imagen ) {
            return res.status(404).send('Not found');
          }

          var hasta = moment( new Date ).startOf('day').add( video.duracion, 'seconds'  ).format('H:mm:ss.SSS');

          if ( imagen ) {
            subtitulo = imagen.subtitulo;
          } else {
            subtitulo = '';
          }
          
          res.render('desdevideo', {
            video: video,
            duracion: video.duracion,
            hasta: hasta,
            subtitulo: subtitulo
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
