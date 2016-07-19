'use strict';

var path = require ('path');

var paths = {
    dbImagenes: path.join( __dirname, '../db/imagenes.db'),
    dbVideos: path.join( __dirname, '../db/videos.db'),
    dbUsers: path.join( __dirname, '../db/users.db'),

    gifs : path.join( __dirname, '../public/gifs/'),
    imagenes : path.join( __dirname, '../public/images/'),
    subtitulos : path.join( __dirname, '../public/subtitulos/'),
    temp : path.join( __dirname, '../public/temp/'),
    videos : path.join( __dirname, '../public/videos/')
};

module.exports = paths;