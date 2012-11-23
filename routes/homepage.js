
/*
 * GET homepage
 */

module.exports = function(app){

  app.get("/", function(req, res){
    res.render("homepage",{
      title: "Mouse Tracker"
    })
  })

}