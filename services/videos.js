'use strict';

var async = require('async');
var ffmpeg = require('fluent-ffmpeg');
var path = require('path');
var fs = require('fs');
var nedb = require('nedb');
var uuid = require('uuid');
var gm = require('gm');
var destino = path.join( __dirname, '../public/videos');
var destinoImagenes = path.join( __dirname, '../public/images');
var dbVideos = new nedb({
    filename: path.join( __dirname, '../db/videos.db'), 
});
function VideoServices() { };

VideoServices.prototype.procesarVideo = function ( pathVideo, callback ) {
    var nombres = [];

    dbVideos.loadDatabase();

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
                var pathImagenOptimizada = destinoImagenes + '/' + uuid.v4() + '.jpg';
                gm( destinoImagenes + '/' + nombres )    // currently a png
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
                return callback ( err );
            } else {

             var video = {
                    nombre: path.basename(pathVideo),
                    metadata: respuestas[0].format,
                    screenshot: path.basename(respuestas[1]),
                    duracion: respuestas[0].format.duration,
                    fechaInsert: Date.now()
            };
            dbVideos.insert( video, callback);
        }
    });
};

module.exports = new VideoServices();