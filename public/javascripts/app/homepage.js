var M = {};
M.Pages = {};

M.Player = {};
M.Player.Controls = {}
M.Player.Controls.Recording = false;
M.Player.Controls.Replay = false;

M.Player.Socket = io.connect('http://localhost:3456');

M.Pages.Home = (function(){

  var start_btn, stop_btn, replay_btn;

  var init = function (){
    touchDom();
    attachHandlers();
  };

  var touchDom = function(){
    start_btn = $("#start_btn");
    stop_btn = $("#start_btn");
    replay_btn = $("#start_btn");
  }

  var attachHandlers = function(){
    start_btn.on("click", startRecording);
    start_btn.on("click", stopRecording);
    start_btn.on("click", replay);

    $("body").mousemove(function(e) {
      if(!M.Player.Controls.Recording) return;
      M.Player.Socket.emit('mouse_move',{x:e.x, y:e.y});
    });

    M.Player.Socket.on('replay', function (data) {
      if(!M.Player.Controls.Replay) return;
      console.log(data);
    });


  }

  var startRecording = function(e){
    M.Player.Controls.Recording = true;
    M.Player.Controls.Replay = false;
  };

  var stopRecording = function(e){
    M.Player.Controls.Recording = false;
    M.Player.Controls.Replay = false;
  };

  var replay = function(e){
    M.Player.Controls.Recording = false;
    M.Player.Controls.Replay = true;
  };

  return {
    init: init
  }

}());

$(function(){
  M.Pages.Home.init();
})

