
/**
 * Mouse schema
 */

var _ = require('underscore');
var mongoose = require('mongoose');

module.exports = function (app) {

  // CONSTANTS
  var cons = {

      // Model name
      MODEL_NAME: 'Session',

      // Write only fields
      WRITE_FIELDS: ['client_id'],

      // Read only fields
      READ_FIELDS: ['client_id'],

      // Valid sort fields
      SORT_FIELDS: ['client_id'],

      // Fields to query on
      QUERY_FIELDS: ['client_id']

    },

    SessionSchema = mongoose.Schema({
      client_id : String
    });

  // PROTOTYPE METHODS
  SessionSchema.methods.someMethod = function (argument) {
    //here would add some extra methods for a model, other than what mongoose offers.
  };

  return _.extend(app.get("db").model(cons.MODEL_NAME, SessionSchema), cons);
};