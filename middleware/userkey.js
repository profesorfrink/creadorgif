'use strict';

var uuid = require('uuid');

exports.checkUserKey = function ( req, res, next ) {
    if ( !req.session.userKey ) {
        req.session.userKey = uuid.v4();
    }
    res.locals.userKey = req.session.userKey;
    next();
}