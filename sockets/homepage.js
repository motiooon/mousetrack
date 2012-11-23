var io = require('socket.io').listen(3456);

io.sockets.on('connection', function (socket) {

  socket.on('mouse_movee', function (coordinates) {
    console.log(coordinates.x, coordinates.y);
  });

  socket.on('disconnect', function () {
    io.sockets.emit('user disconnected');
  });
});