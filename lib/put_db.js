/*jslint node: true, indent: 2 */
'use strict';

var mockDB = require('./mockDB');

function validateDbName(name) {
  return (/^[a-z][a-z0-9_\$\(\)\+\-\/]*$/).test(name);
}

module.exports = function (self) {

  return function (req, res, next) {

    // If the database already exists.
    if (self.databases.hasOwnProperty(req.params.db)) {
      res.send(412, { error : 'file_exists', reason : 'The database could not be created, the file already exists.' });
      return false;
    }

    // Check if the name is legal
    if (!validateDbName(req.params.db)) {
      res.send(400, { error : 'illegal_database_name', reason : "Name: '" + req.params.db + "'. Only lowercase characters (a-z), digits (0-9), and any of the characters _, $, (, ), +, -, and / are allowed. Must begin with a letter." });
      return false;
    }

    // Create the database
    if (!self.databases.hasOwnProperty(req.params.db)) {
      self.databases[req.params.db] = mockDB();
      self.changes[req.params.db] = [];
      res.send(201, { ok : true });
      self.emit('PUT', { database : req.params.db, type: 'database' });
    }
    next();
  };

};
