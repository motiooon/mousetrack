
/**
 * Mouse schema
 */

var _ = require('underscore');
var mongoose = require('mongoose');

module.exports = function (app) {

  // CONSTANTS
  var cons = {

      // Model name
      MODEL_NAME: 'Mouse',

      // Write only fields
      WRITE_FIELDS: ['x', 'y', 'cord'],

      // Read only fields
      READ_FIELDS: ['x', 'y', 'cord'],

      // Valid sort fields
      SORT_FIELDS: ['x', 'y', 'cord'],

      // Fields to query on
      QUERY_FIELDS: ['x', 'y', 'cord']

    },

    MouseSchema = mongoose.Schema({
        x : String,
        y : String,
        cord : String
    });

  // PROTOTYPE METHODS
  MouseSchema.methods.someMethod = function (argument) {
    //here would add some extra methods for a model, other than what mongoose offers.
  };

  return _.extend(app.get("db").model(cons.MODEL_NAME, MouseSchema), cons);
};