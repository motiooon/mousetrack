/**
 * Models loading
 */
var fs = require('fs');

module.exports = function (app) {
  app.models = {};
  fs.readdirSync(__dirname).forEach(function (file) {
    if (file === 'index.js' || file.indexOf('.js') === -1) return;
    var name = file.substr(0, file.indexOf('.'));
    if (name) {
      var Model = require('./' + name)(app);
      global[Model.MODEL_NAME] = app.models[Model.MODEL_NAME] = Model;
    }
  });
};