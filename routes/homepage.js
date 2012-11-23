
/*
 * GET homepage
 */

module.exports = function(app){

  app.get("/", function(req, res){

    var hostname = req.header('Host').split(':')[0];

    res.render("homepage",{
      title: "Mouse Tracker",
      host: hostname
    })
  })

}