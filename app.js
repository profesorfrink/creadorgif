var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var kue = require('kue');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var videoServices = require('./services/videos');

var routes = require('./routes/index');
var videos = require('./routes/videos');
var imagenes = require('./routes/imagenes');
var giphy = require('./routes/giphy');

var app = express();

var checkUserKey = require('./middleware/userkey');

var nedb = require('nedb');

var dbUsers = new nedb({
    filename: path.join( __dirname, 'db/users.db'), 
    autoload: true
});

var dbVideos = new nedb({
    filename: path.join( __dirname, 'db/videos.db'), 
});

const SECRETSESSION =  'njasodjoia dñohaopdihpsnmn jkhdaf ipuòi83748913247/*';
const SECRETCOOKIE = 'pokdadjoi fv  jklalda123+-%&/';
const COOKIEKEY = 'sessId';

var http = require('http').Server(app);
var io = require('socket.io')(http);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(  SECRETCOOKIE, { key: COOKIEKEY } ));

app.use(session({
  store: new RedisStore(),
  secret: SECRETSESSION,
  resave: true,
  saveUninitialized: true
}))
app.use(express.static(path.join(__dirname, 'public')));


app.use( checkUserKey.checkUserKey );
app.use('/', routes);
app.use('/v', videos);
app.use('/i', imagenes);
app.use('/g', giphy);

kue.app.set('title', 'Jobs');
var subApp = express();
subApp.use('', kue.app)
app.use('/adminkue', subApp);

io.on('connection', function(socket){
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;

  var user = {
    ip: clientIp,
    socketId: socketId
  };
  dbUsers.update({ ip: user.ip }, { ip: user.ip, socketId: user.socketId }, { upsert: true }, function (err, numReplaced, upsert) {
    // console.log('Ip Cliente: ' + user.ip + ', socketId: ' + user.socketId );
  });
  
  socket.on('room', function(room) {
      console.log('room ' + room );
      socket.join(room);
  });

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
} else {
  app.enable('trust proxy');
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.on('imagenNueva', function ( imagen ) {
  console.log('mensaje a ', imagen.ip);
  io.to( imagen.ip ).emit( 'imagenProcesada', imagen );
 
});

app.on('clipCreado', function ( pathVideo, ipUsuario ) {
    var datos = {
      pathVideo: pathVideo,
      watermark: ''
    };
    videoServices.procesarVideo( datos, function ( err, videoGuardado ) {
      io.to( ipUsuario ).emit( 'clipCreado', videoGuardado );
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
