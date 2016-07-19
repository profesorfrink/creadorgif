'use strict';

var express = require('express');
var router = express.Router();
var multer = require('multer');
var async = require('async');

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
var videoServices = require('../services/videos');

var db = new nedb({
    filename: path.join( __dirname, '../db/imagenes.db'), 
    autoload: true
});

var memes = new nedb({
    filename: path.join( __dirname, '../db/memes.db')
});

var destino = path.join( __dirname, '../public/videos');
var destinoImagenes = path.join( __dirname, '../public/images');
var destinoGifs = path.join( __dirname, '../public/gifs');
var destinoTemp = path.join( __dirname, '../public/temp');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destino);
  },
  filename: function (req, file, cb) {
    cb(null, +Date.now() + '.mp4');
  }
});
var storageImagenes = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destinoTemp);
  },
  filename: function (req, file, cb) {
    // console.log( 'req', req );
    // console.log( 'file', file );
    cb(null, uuid.v4() + path.extname(file.originalname) ); 
  }
});

var uploadImage = multer({
    dest: destinoImagenes,
    storage: storageImagenes,
    fileFilter: function (req, file, cb) {
        
        if ( 'image/jpeg, image/pjpeg, image/png'.indexOf(file.mimetype) > -1 ) {
            cb(null, true);
        } else {
            cb (null, false );
        }
    }

});
var upload = multer({
    dest: destino,
    storage: storage,
    fileFilter: function (req, file, cb) {
        
        if ( 'video/mp4, video/webm, video/x-matroska'.indexOf(file.mimetype) > -1 ) {
            cb(null, true);
        } else {
            cb (null, false );
        }
    }
});
/* GET home page. */
router.get('/', function(req, res, next) {
    db.loadDatabase();
    db.find({}).sort({ fecha: -1 }).limit(10).exec( function (err, imagenes ) {
        if ( err ) {
            return next( err );
        } else {
            res.render('index', { 
                imagenes: imagenes 
            });
        }
    });
  
});

router.post('/uploadimagen', uploadImage.single('file'), function ( req, res, next ) {
    
    gm(destinoTemp + '/' + req.file.filename)
    .resize(1024, 768, '>')
    .setFormat('jpg')
    .quality(80)
    .write( destinoImagenes +'/' + req.file.filename + '.jpg', function(err){
        if ( err ) {
            return next(err);
        }
        res.status(200).json(req.file);
    });
    
});

router.post('/uploadwm', uploadImage.single('file'), function ( req, res, next ) {
    
    gm(destinoTemp + '/' + req.file.filename)
    .resize(320, 240, '>')
    .write( destinoImagenes +'/' + req.file.filename , function(err){
        if ( err ) {
            return next(err);
        }
        res.status(200).json(req.file);
    });
    
});

router.post('/uploads', upload.single('file'), function ( req, res, next ) {
    var datos = {
        pathVideo: req.file.path,
        watermark: req.body.watermark || ''
    };
    videoServices.procesarVideo ( datos, function ( err, videoGuardado ) {
        if ( err ) {
            return next ( err );
        } else {
            res.status(200).send( videoGuardado );
        }
    });
    
    
});

router.get('/crearmeme', function (req, res, next) {
    res.render('meme');
})

router.post('/generar',  validar.checkDatos, function ( req, res, next ) {
    var datos = req.body;

    // TODO SACAR HARCODEADAS
    datos.colores = datos.colores || 128;
    datos.fps = datos.fps || 10;
    datos.compresion = datos.compresion || 40;
    
    var output = destinoGifs + '/' + uuid.v4() + '.gif';
    var nombreSubtitulo;

    var options = {
      resize: '320:-1',
      from: parseFloat(datos.desde),
      to: parseFloat(datos.hasta),
      text: datos.texto,
      colors: datos.colores,
      fps: datos.fps,
      compress: datos.compresion
    };

    if ( datos.subtitulos ) {
        nombreSubtitulo = uuid.v4();
        var pathSubtitulos = path.join( __dirname, '../public/subtitulos/' + nombreSubtitulo + '.srt' );
        
        var file = fs.writeFileSync( pathSubtitulos, datos.subtitulos);
        delete options.text;
        options.subtitles = pathSubtitulos;
    }

    var jobData = {
        
        output: output,
        options: options,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        idVideo: datos.filename
    };
    if ( datos.watermark.trim() !== 0 ) {
        jobData.watermark = datos.watermark;
        jobData.ubicacionWM = datos.ubicacion;
    }

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



module.exports = router;
