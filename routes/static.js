
/*
 * GET static webpages
 */

module.exports = function(app){

  app.get("/contact", function(req, res){

    var hostname = req.header('Host').split(':')[0];

    res.render("contact",{
      title: "Mouse Tracker",
      host: hostname
    })
  })

  app.get("/about", function(req, res){

    var hostname = req.header('Host').split(':')[0];

    res.render("about",{
      title: "Mouse Tracker",
      host: hostname
    })
  })


}