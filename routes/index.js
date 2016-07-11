'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer');
var async = require('async');
var ffmpeg = require('fluent-ffmpeg');
var path = require('path');
var fs = require('fs');
var gifify = require('gifify');
var nedb = require('nedb');
var kue = require('kue');
var uuid = require('uuid');
var jobs = kue.createQueue(); 
var session = require('express-session');
var validar = require('../middleware/validar');
var gm = require('gm');

var db = new nedb({
    filename: path.join( __dirname, '../db/imagenes.db'), 
    autoload: true
});

var dbVideos = new nedb({
    filename: path.join( __dirname, '../db/videos.db'), 
    autoload: true
});
var destino = path.join( __dirname, '../public/videos');
var destinoImagenes = path.join( __dirname, '../public/images');
var destinoGifs = path.join( __dirname, '../public/gifs');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destino);
  },
  filename: function (req, file, cb) {
    cb(null, +Date.now() + '.mp4') //Appending .jpg
  }
});
var upload = multer({
    dest: destino,
    storage: storage
});
/* GET home page. */
router.get('/', function(req, res, next) {
    db.find({}).sort({ nombre: -1 }).limit(10).exec( function (err, imagenes ) {
        if ( err ) {
            return next( err );
        } else {
            res.render('index', { 
                imagenes: imagenes 
            });
        }
    });
  
});

router.post('/uploads', upload.single('file'), function ( req, res, next ) {
    var nombres = [];
    async.parallel([
        function ( done ) {     //respuestas[0]
            ffmpeg.ffprobe( req.file.path,  done);
        }, 
        function ( done ) {     //respuestas[1]
            ffmpeg( req.file.path )
              .on('filenames', function(filenames) {
                nombres =  filenames.join(', ');
              })
              .on('end', function(err, par1) {
                var pathImagenOptimizada =destinoImagenes + '/' + uuid.v4() + '.jpg';
                gm( destinoImagenes + '/' +nombres )    // currently a png
                    .compress('jpeg')
                    .quality(70)
                    .write(pathImagenOptimizada,  function ( err ) {
                        if ( err ) {
                            return done ( err );
                        } else {
                            done ( null, pathImagenOptimizada );
                        }
                    });
              })
              .screenshots({
                // Will take screens at 20%, 40%, 60% and 80% of the video
                count: 1,
                filename: '%f.png',
                folder: destinoImagenes
              });
        }
        ], function ( err, respuestas ) {
            if ( err ) {
                return next ( err );
            } else {

                var video = {
                    nombre: req.file.filename,
                    metadata: respuestas[0],
                    screenshot: path.basename(respuestas[1])
                };

                dbVideos.insert( video, function ( err, videoGuardado ) {
                    if ( err ) {
                        return next ( err );
                    } else {
                        res.status(200).send({
                            filename: videoGuardado.nombre,
                            metadata: respuestas[0].format,
                            screenshot: videoGuardado.screenshot
                        });
                    }
                });   
            }
    });
    
});

router.post('/generar',  validar.checkDatos, function ( req, res, next ) {
    var datos = req.body;
    var input = destino + '/' + datos.filename;
    var output = destinoGifs + '/' + uuid.v4() + '.gif';
    var nombreSubtitulo;

    var options = {
      resize: '320:-1',
      from: Math.floor( parseInt(datos.desde) ),
      to: Math.ceil( parseInt(datos.hasta) + 1),
      text: datos.texto,
      colors: 128
    };

    if ( datos.subtitulos ) {
        nombreSubtitulo = uuid.v4();
        var pathSubtitulos = path.join( __dirname, '../public/subtitulos/' + nombreSubtitulo + '.ass' );
        
        var file = fs.writeFileSync( pathSubtitulos, datos.subtitulos);
        delete options.text;
        options.subtitles = pathSubtitulos;
    }

    var jobData = {
        input: input,
        output: output,
        options: options,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };
    var job = jobs.create('procesar', jobData );
    job.on('complete',  function ( imagen ) {
        res.app.emit('imagenNueva', imagen );
    });
    job.save( function (err ) {
        if ( err ) {
            return next ( err );
        } else {
            res.status(200).json('ok');
        }
    });

    
});

jobs.process('procesar', function (job, done){
 /* carry out all the job function here */
    var gif = fs.createWriteStream(job.data.output);

    var stream = gifify( job.data.input, job.data.options).pipe(gif);

    stream.on( 'finish', function () {
        
        async.parallel([
            function ( done ) {
                var imagen = {
                    path: job.data.output,
                    nombre: path.basename ( job.data.output ),
                    fecha: Date.now(),
                    desde: job.data.options.from,
                    hasta:  job.data.options.to,
                    texto: job.data.options.text,
                    colores: job.data.options.colors,
                    resize: job.data.options.resize,
                    video: job.data.input,
                    ip: job.data.ip
                };
                db.insert( imagen, done );
            },
            function ( done ) {
                var pathFrame =destinoImagenes + '/' + uuid.v4() + '.png';
                gm( job.data.output + '[0]')
                    .write(pathFrame, done );
            },
            
            ], function ( err, resultados ) {
                if ( err ) {
                    return done ( err );
                } else {
                    done ( null, resultados[0] );
                }
        }) ;
        

        

});


});

module.exports = router;
