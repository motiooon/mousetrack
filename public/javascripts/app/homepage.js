var M = {};
M.Pages = {};

M.Player = {};
M.Player.Controls = {}
M.Player.Controls.Recording = false;
M.Player.Controls.Replay = false;

M.Player.CurrentMoveIndex = 0;
M.Player.TotalMoves = 0;

M.Player.Socket = io.connect('http://' + window.location.hostname + ':3456');

M.Pages.Home = (function(){

  var start_btn, stop_btn, replay_btn, replay_cursor;

  var init = function (){
    touchDom();
    attachHandlers();
  };

  var touchDom = function(){
    start_btn = $("#start_btn");
    stop_btn = $("#stop_btn");
    replay_btn = $("#replay_btn");
    replay_cursor = $(".replay_cursor");
  }

  var attachHandlers = function(){
    start_btn.on("click", startRecording);
    stop_btn.on("click", stopRecording);
    replay_btn.on("click", replay);

    $("body").mousemove(function(e) {
      //console.log(e.pageX+"x"+e.pageY+"x"+ elapsedT);
      if(!M.Player.Controls.Recording) return;
      var elapsedT = new Date() - M.Player.Timer;
      M.Player.Timer = new Date();
      M.Player.Socket.emit('mouse_move',{cord:e.pageX+"x"+e.pageY+"x"+ elapsedT});
    });

    M.Player.Socket.on('replay_move', function (data) {
      if(!M.Player.Controls.Replay) return;

      console.log(data.cord);
      var coords = data.cord.split("x");
      var x = coords[0];
      var y = coords[1];
      var tillNext = coords[2];
      if(data.total) M.Player.TotalMoves = data.total;
      replay_cursor.css({"left": x + "px", "top": y + "px"});
      M.Player.CurrentMoveIndex = data.index;
      if(M.Player.CurrentMoveIndex > M.Player.TotalMoves -2) return;
      window.setTimeout(askForNextMove, tillNext, true);
    });

    var askForNextMove = function(){
      console.log(M.Player.CurrentMoveIndex, "/", M.Player.TotalMoves);
      if(M.Player.CurrentMoveIndex > M.Player.TotalMoves -1) return;
      M.Player.Socket.emit('play_next', {index: M.Player.CurrentMoveIndex+1})
    }

    M.Player.Socket.on('can_dance', function (data) {
      M.Player.Timer = new Date();
      M.Player.Controls.Recording = true;
      M.Player.Controls.Replay = false;
    });

  }

  var startRecording = function(e){
    M.Player.Socket.emit('new_session',{});
    replay_cursor.addClass("hide");
  };

  var stopRecording = function(e){
    M.Player.Controls.Recording = false;
    M.Player.Controls.Replay = false;
  };

  var replay = function(e){
    M.Player.Controls.Recording = false;
    M.Player.Controls.Replay = true;
    replay_cursor.removeClass("hide").css({"position": "absolute"});
    M.Player.Socket.emit("replay", {});
  };

  return {
    init: init
  }

}());

$(function(){
  M.Pages.Home.init();
})

