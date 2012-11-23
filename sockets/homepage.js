var clients = {};
var async = require("async");

module.exports = function(app){

  io = app.get("socket");

  io.sockets.on('connection', function (socket) {

    socket.on("new_session", function(data){
      var s = new Session({client_id: socket.id});
      s.save(function(err){
        if(err) throw err;
        socket.last_session = s._id;
        socket.emit("can_dance", {});
      })
    })

    socket.on('mouse_move', function (data) {
      client.lpush(socket.last_session, data.cord);
    });


    socket.on('replay', function (data) {

        client.llen(socket.last_session, function(err, total){
          if(err) throw err;
          console.log("total>>>>", total);
          socket.total = total;
          client.lindex(socket.last_session, data.index, function(err, item){
            if(err) return callback(err);
            socket.emit("replay_move", {cord: item, total: total, index: 0})
          })
        })
    });

    socket.on('play_next', function (data) {

      console.log("next>>>>", data.index);

      client.lindex(socket.last_session, data.index, function(err, item){
        if(err) return callback(err);
        socket.emit("replay_move", {cord: item, index: data.index})
      })

    });

    socket.on('disconnect', function () {
      io.sockets.emit('user disconnected');
    });
  });

}
