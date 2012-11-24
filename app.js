
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , cons = require("consolidate")
  , swig = require("swig")
  , mongoose = require("mongoose")
  , RedisStore    = require('connect-redis')(express)
  , redis         = require('redis')
  , path = require('path');

var app = express();

// Redis Connect Options
global.client = redis.createClient("6379", "localhost" , {return_buffers: false});

var redis_options = {
  client : client
}

global.cookieParser = express.cookieParser('mousetrack_cookie');
global.sessionStore = new RedisStore(redis_options);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.engine('html', cons.swig);
  app.set('view engine', 'html');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(cookieParser);
  app.use(express.session({secret : "mousetrack", key: 'express.sid', store : sessionStore}));
  app.use(function(req, res, next) {
    res.locals.recording = req.session.recording ? req.session.recording : false;
    res.locals.replaying = req.session.replaying ? req.session.replaying : false;
    next();
  });
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('view options', { layout: false });
  swig.init({ root: __dirname + '/views', allowErrors: true});
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//add a socket property to app so we can use it downstream
var server = require('http').createServer(app);
app.set("socket", require('socket.io').listen(server));

app.get("socket").configure(function (){
  app.get("socket").set('authorization', function (handshakeData, callback) {
    console.log("handshakeData>>", handshakeData);
    callback(null, true); // error first callback style
  });
});

//Boot sockets -- will go into boot folder
require("./sockets").call(this, app);

app.set('db', mongoose.createConnection('localhost', 'mousetrack'));
app.get('db').on('error', console.error.bind(console, 'connection error:'));
app.get('db').once('open', function callback () {
  // yay!
});

// Boot models -- will go into boot folder
require("./models").call(this, app);

// Load routes
routes.call(this, app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
