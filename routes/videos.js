'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var nedb = require('nedb');

var dbVideos = new nedb({
    filename: path.join( __dirname, '../db/videos.db'), 
});

/* GET users listing. */
router.get('/', function(req, res, next) {
    dbVideos.loadDatabase(function (err) {    // Callback is optional
        dbVideos.find({}).exec( function ( err, videos ) {
          if ( err ) {
              return next ( err );
          } else {
              res.render('videos', {
                  videos: videos
              });
          }
        });
    });
  
});

module.exports = router;
