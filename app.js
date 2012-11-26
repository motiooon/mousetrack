
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
global.client = redis.createClient("6379", "nodejitsudb1680086960.redis.irstack.com" , {return_buffers: false});

client.auth("nodejitsudb1680086960.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4", function(err){
  if(err) throw err;
  console.log("connected");
})

var redis_options = {
  client : client
}

global.cookieParser = express.cookieParser('mousetrack_cookie');
global.sessionStore = new RedisStore(redis_options);

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
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
    res.locals.recording = req.session && req.session.recording ? req.session.recording : false;
    res.locals.replaying = req.session && req.session.replaying ? req.session.replaying : false;
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
    //console.log("handshakeData>>", handshakeData);
    callback(null, true); // error first callback style
  });
});

//Boot sockets -- will go into boot folder
require("./sockets").call(this, app);

app.set('db', mongoose.connect('mongodb://nodejitsu:d097f9d08d9740df73a25d033ef621ee@alex.mongohq.com:10075/nodejitsudb3194546143',function (err) {
  if (err) { console.log("Could not connect to database","alex.mongohq.com" ); throw err; }
}));

//confirm connection
app.get("db").connection.on('open', function () {
  console.log("mongodb connection open");
});

// Boot models -- will go into boot folder
require("./models").call(this, app);

// Load routes
routes.call(this, app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
