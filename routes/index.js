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

router.post('/uploads', upload.single('file'), function ( req, res, next ) {
    videoServices.procesarVideo ( req.file.path, function ( err, videoGuardado ) {
        if ( err ) {
            return next ( err );
        } else {
            res.status(200).send( videoGuardado );
        }
    });
    
    
});

router.post('/generar',  validar.checkDatos, function ( req, res, next ) {
    var datos = req.body;
    
    var output = destinoGifs + '/' + uuid.v4() + '.gif';
    var nombreSubtitulo;

    var options = {
      resize: '320:-1',
      from: parseFloat(datos.desde),
      to: parseFloat(datos.hasta),
      text: datos.texto,
      colors: 128
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
