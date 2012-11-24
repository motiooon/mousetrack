var clients = {};
var async = require("async");
var parseCookies = require('connect').utils.parseSignedCookies;
var cookie = require('../node_modules/express/node_modules/cookie');

module.exports = function(app){

  io = app.get("socket");

  io.sockets.on('connection', function (socket) {

    var _cookies = cookie.parse(socket.handshake.headers.cookie);
    var express_sid = parseCookies(_cookies, "mousetrack");

    async.waterfall([

      function grab_session_from_handshake(callback){

        sessionStore.get(express_sid["express.sid"], function(err, session){
          if(err) return callback(err);
          console.log("session>>>",session);
          if(session.user) {callback(null, session.user);
          }else{
            callback(new Error("no user in session"))
          }
        });
      },
      function init_sockets(user, callback){
        socket.on("new_session", function(data){

          var s = new Session({client_id: user});
          s.save(function(err){
            if(err) throw err;
            socket.last_session = user;
            socket.emit("can_dance", {});
          })
        })

        socket.on('mousemove', function (data) {
          client.lpush(socket.last_session, data);
        });

        socket.on('scroll', function (data) {
          client.lpush(socket.last_session, data);
        });

        socket.on('click', function (data) {
          client.lpush(socket.last_session, data);
        });

        socket.on('replay', function (data) {

          client.llen(socket.last_session, function(err, total){
            if(err) throw err;

            socket.total = total;
            client.lindex(socket.last_session, socket.total -1, function(err, item){
              if(err) return callback(err);
              socket.emit("replay_move", {e_data : item, total: total, index: 0})
            })
          })
        });

        socket.on('play_next', function (data) {

          client.lindex(socket.last_session, socket.total - data.index -1, function(err, item){
            if(err) return callback(err);
            socket.emit("replay_move", {e_data: item, index: data.index})
          })

        });

        socket.on('disconnect', function () {
          io.sockets.emit('user disconnected');
        });
      }

    ], function(err, result){
      if(err) throw(err);
      console.log("sockets initialized")
    })

  });

}
