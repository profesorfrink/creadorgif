'use strict';

var async = require('async');
var ffmpeg = require('fluent-ffmpeg');
var path = require('path');
var paths = require('../paths');
var fs = require('fs');
var nedb = require('nedb');
var uuid = require('uuid');
var gm = require('gm');
var destino = path.join( __dirname, '../public/videos');
var destinoImagenes = path.join( __dirname, '../public/images');
var destinoTemp = path.join( __dirname, '../public/temp');

var dbVideos = new nedb({
    filename: paths.dbVideos 
});

function VideoServices() { };

var aplicarAcciones = function ( err, pathVideo, cb) {
    if ( err ) {
        return cb (err);
    }
    dbVideos.loadDatabase();
    var nombres = [];
    async.parallel([
        function ( done ) {     //respuestas[0]
            ffmpeg.ffprobe( pathVideo,  done);
        }, 
        function ( done ) {     //respuestas[1]
            ffmpeg( pathVideo )
              .on('filenames', function(filenames) {
                nombres =  filenames.join(', ');
              })
              .on('end', function(err, par1) {
                var pathImagenOptimizada = path.join( paths.imagenes, uuid.v4() + '.jpg');
                gm(  path.join( paths.imagenes, nombres ) )    // currently a png
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
        } ], function ( err, respuestas ) {
            if ( err ) {
                return cb ( err );
            } else {

             var video = {
                    nombre: path.basename( pathVideo ),
                    metadata: respuestas[0].format,
                    screenshot: path.basename(respuestas[1]),
                    duracion: respuestas[0].format.duration,
                    fechaInsert: Date.now()
            };
            dbVideos.insert( video, cb);
        }
    });

};

VideoServices.prototype.procesarVideo = function ( datos, callback ) {
    var wmk;
    if ( datos.watermark ) {
        wmk = datos.watermark;
    } else {
        wmk = '';
    }
    if ( wmk.trim() !== '') {
        var nombreNuevo = path.join( destino, uuid.v4() + path.extname( datos.pathVideo ));
        var pathWatermark = path.join ( destinoTemp, datos.watermark );
        var ubicacionWM;
        if ( !datos.ubicacionWM ) {
            ubicacionWM = 0;
        } else {
            ubicacionWM = parseInt( datos.ubicacionWM );
        }
        var wm;
        switch(ubicacionWM) {
            case 0: //centrado
                wm = ' overlay=(W-w)/2:(H-h)/2 ';
                break;
            case 1: //Top left
                wm = ' overlay=5:5 '
                break;
            case 2: // TR
                wm = ' overlay=W-w-5:5 ';
                break;
            case 3: //BR
                wm = ' overlay=W-w-5:H-h-5 ';
                break;
            case 4: //BL
                wm = ' overlay=5:H-h-5 ';
                break;
            default:
                break;
        }
        ffmpeg( datos.pathVideo )
            .size('320x?')
            .addOptions([
                '-vf', 'movie='+ pathWatermark + ' [watermark]; [in] [watermark] ' + wm + ' [out]',
                '-strict -2'
            ])
            .on('error', function(err, stdout, stderr) {
              console.log("ffmpeg stdout:\n" + stdout);
              console.log("ffmpeg stderr:\n" + stderr);
              return callback(err);
            })
            .on('end', function() {
                fs.unlink(datos.pathVideo, function () {
                    aplicarAcciones (null, nombreNuevo, callback );
                });
            })
            .save( nombreNuevo );
    } else {
        aplicarAcciones (null, datos.pathVideo, callback );
    }
};

module.exports = new VideoServices();