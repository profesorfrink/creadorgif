'use strict';
var youtubedl = require('youtube-dl');

exports.validar = function (req, res, next ) {
    var url = req.body.urlVideo;
     youtubedl.getInfo(url, function(err, info) {
        if (err) {
            return next(err);
        }
        var durationSplit = info.duration.split(':').reverse();
        var acumuladorSegundos = 0;
        var enSegundos = 0;
        if ( durationSplit[2] ) {
            enSegundos = parseInt( durationSplit[2] ) * 60 * 60;
            acumuladorSegundos += enSegundos;
        }

        if ( durationSplit[1] ) {
            enSegundos = parseInt( durationSplit[1] ) * 60 ;
            acumuladorSegundos += enSegundos;
        }

        acumuladorSegundos += parseInt( durationSplit[0] );

        if ( acumuladorSegundos > 180 ) {
            return res.status(409).json('El video no puede durar más de 3 minutos ');
        } else {
            return next();
        }
     });
}
