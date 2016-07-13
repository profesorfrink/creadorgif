'use strict';
var async = require('async');
var gm = require('gm').subClass({imageMagick: true});
var uuid = require('uuid');
var path = require('path');
var fs = require('fs');
var nedb = require('nedb');
var gifify = require('gifify');
var ffmpeg = require('fluent-ffmpeg');

var kue = require('kue');
var jobs = kue.createQueue(); 


var db = new nedb({
    filename: path.join( __dirname, '../db/imagenes.db')
});
var dbVideos = new nedb({
    filename: path.join( __dirname, '../db/videos.db')
});

var destino = path.join( __dirname, '../public/videos');
var destinoImagenes = path.join( __dirname, '../public/images');
var destinoGifs = path.join( __dirname, '../public/gifs');

jobs.process('crearClip', function (job, done){
  console.log('datos', job.data );

  var duracion = parseFloat(job.data.hasta) - parseFloat(job.data.desde);

  ffmpeg( job.data.input )
    .videoCodec('libx264')
    .audioCodec('libmp3lame')
    .audioBitrate('32k')
    .size('320x?')
    .aspect('4:3')
    .seekInput( job.data.desde )
    .duration( duracion )
    .on('error', function(err) {
      console.log('An error occurred: ' + err.message);
    })
    .on('end', function() {
            
      done ( null, job.data.output );
    })
    .save( job.data.output );
});

jobs.process('procesar', function (job, done){
    console.log('procesando', job.data);
    db.loadDatabase();
    dbVideos.loadDatabase();

    var gif = fs.createWriteStream(job.data.output);
    dbVideos.findOne( { _id: job.data.idVideo }).exec( function ( err, video ) {

        var inputVideo = path.join( destino, video.nombre );
        var imagenVideo = path.join( destinoImagenes, video.screenshot );

        var stream = gifify( inputVideo, job.data.options).pipe(gif);
        var pathFrame;
        stream.on( 'finish', function () {
            
            async.waterfall ([
                function ( done ) {
                    pathFrame = destinoImagenes + '/' + uuid.v4() + '.jpg';
                    gm( imagenVideo)
                        .compress('jpeg')
                        .quality(70)
                        .resize('320','-1')
                        .write( pathFrame, function ( err, resultado ) {
                            if ( err ) console.log(err);
                            done(null, pathFrame);
                        });
                },
                function ( pathScreenshot, done ) {
                    var imagen = {
                        path: job.data.output,
                        nombre: path.basename ( job.data.output ),
                        fecha: Date.now(),
                        desde: job.data.options.from,
                        hasta:  job.data.options.to,
                        texto: job.data.options.text,
                        colores: job.data.options.colors,
                        resize: job.data.options.resize,
                        video: inputVideo,
                        ip: job.data.ip,
                        screenshot: path.basename(pathFrame),
                        idVideo: video._id
                    };
                    db.insert( imagen, done );
                }
                ], function ( err, resultados ) {
                    if ( err ) {
                        return done ( err );
                    } else {
                        done ( null, resultados );
                    }
            }) ;
        });
    });

});