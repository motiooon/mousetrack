
/*
 * GET homepage
 */


module.exports = function(app){

  app.get("/start_user_session", function(req, res){
    req.session.recording = true;
    req.session.replaying = false;
    res.send(200);
  });

  app.get("/stop_user_session", function(req, res){
    req.session.recording = false;
    req.session.replaying = false;
    res.send(200);
  });

  app.get("/replay_user_session", function(req, res){
    req.session.recording = false;
    req.session.replaying = true;
    res.send(200);
  });

  app.get("/stop_replay_user_session", function(req, res){
    req.session.recording = false;
    req.session.replaying = false;
    res.send(200);
  });

  app.get("/set_current_index", function(req, res){
    req.session.recording = false;
    req.session.replaying = true;
    req.session.current_index = req.query.index;
    res.send(200);
  });





}