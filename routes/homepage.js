
/*
 * GET homepage
 */

var uuid = require('node-uuid');

module.exports = function(app){

  app.get("/", function(req, res){

    req.session.user =  uuid.v1();

    var hostname = req.header('Host').split(':')[0];

    res.render("homepage",{
      title: "Mouse Tracker",
      host: hostname
    })
  })

}