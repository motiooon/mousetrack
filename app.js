
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

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.engine('html', cons.swig);
  app.set('view engine', 'html');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('mousetrack_cookie'));
  app.use(express.session({secret : "mousetrack", key: 'express.sid', store : new RedisStore(redis_options)}));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('view options', { layout: false });
  swig.init({ root: __dirname + '/views', allowErrors: true});
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//add a socket property to app so we can use it downstream
app.set("socket", require('socket.io').listen(3456));

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

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
