var M = {};
M.Pages = {};

M.Player = {};
M.Player.Controls = {}
M.Player.Controls.Recording = player_states.recording;
M.Player.Controls.Replay = player_states.replaying;

M.Player.CurrentMoveIndex = 0;
M.Player.TotalMoves = 0;

M.Player.Socket = io.connect('http://' + window.location.hostname + ':3000');

M.Pages.CorePlayer = (function(){

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


    /**
     * Tracking user mouse moves
     * */

    $("body").mousemove(function(e) {
      //console.log(e.type);
      if(!M.Player.Controls.Recording) return;
      var elapsedT = new Date() - M.Player.Timer;
      M.Player.Timer = new Date();
      M.Player.Socket.emit('mousemove', JSON.stringify({
        e_type:e.type,
        pageX:e.pageX,
        pageY: e.pageY,
        elapsedT: elapsedT
      }));
    });

    /**
     * body click
     * */

    $("body").click(function(e) {
      console.log(e.target);
      if(!M.Player.Controls.Recording) return;
      var elapsedT = new Date() - M.Player.Timer;
      M.Player.Timer = new Date();
      M.Player.Socket.emit('click', JSON.stringify({
        e_type:e.type,
        e_target:"", // TODO still to figure out how to identify an elem
        elapsedT: elapsedT
      }));
    });

    /**
     * hover
     * */

    $("body").hover(function(e) {

    });

    /*
    * Unload events
    *
    * */

    $(window).unload(function(e) {

    });


    /**
     * Tracking user mouse scroll
     * */

    $(window).scroll(function(e) {

      if(!M.Player.Controls.Recording) return;
      var elapsedT = new Date() - M.Player.Timer;
      M.Player.Timer = new Date();

      M.Player.Socket.emit('scroll', JSON.stringify({
        e_type:e.type,
        scrollTop:$(window).scrollTop(),
        scrollLeft: $(window).scrollLeft(),
        elapsedT: elapsedT
      }));
    });

    M.Player.Socket.on('replay_move', function (data) {
      if(!M.Player.Controls.Replay) return;
      if(data.total) M.Player.TotalMoves = data.total;

      var _data = JSON.parse(data.e_data);

      switch(_data.e_type){
        case "scroll":
          console.log("scroll", _data.scrollTop, _data.scrollLeft);
          M.Player.CurrentMoveIndex = data.index;
          $.scrollTo({top:_data.scrollTop, left: _data.scrollLeft}, _data.elapsedT);
          window.setTimeout(askForNextMove, _data.elapsedT, true);
          break;
        case "mousemove":
          console.log("move", _data.pageX, _data.pageY);

          replay_cursor.css({"left": _data.pageX + "px", "top": _data.pageY + "px"});

          M.Player.CurrentMoveIndex = data.index;
          window.setTimeout(askForNextMove, _data.elapsedT, true);
          break;
        case "click":
          console.log("click", _data.e_target);
          $(_data.e_target).trigger("click");
          M.Player.CurrentMoveIndex = data.index;
          window.setTimeout(askForNextMove, _data.elapsedT, true);
          break;
        default:
          console.log("nothing");
      }
    });

    var askForNextMove = function(){
      console.log(M.Player.CurrentMoveIndex, "/", M.Player.TotalMoves -1);
      if(M.Player.CurrentMoveIndex == M.Player.TotalMoves -1) {
        $.get("/stop_replay_user_session", function(data){
          replay_cursor.addClass("hide");
        })
        return;
      }
      M.Player.Socket.emit('play_next', {index: M.Player.CurrentMoveIndex+1})
    }

    M.Player.Socket.on('can_dance', function (data) {
      M.Player.Timer = new Date();
      M.Player.Controls.Recording = true;
      M.Player.Controls.Replay = false;
    });

  }

  var startRecording = function(e){
    $.get("/start_user_session", function(data){
        M.Player.Socket.emit('new_session',{});
      });
    replay_cursor.addClass("hide");
  };

  var stopRecording = function(e){
    M.Player.Controls.Recording = false;
    M.Player.Controls.Replay = false;
    $.get("/stop_user_session", function(data){
      replay_cursor.addClass("hide");
    });

  };

  var replay = function(e){
    M.Player.Controls.Recording = false;
    M.Player.Controls.Replay = true;
    $.get("/replay_user_session", function(data){
      replay_cursor.removeClass("hide").css({"position": "absolute"});
      M.Player.Socket.emit("replay", {});
    });

  };

  return {
    init: init
  }

}());

$(function(){
  M.Pages.CorePlayer.init();
})

