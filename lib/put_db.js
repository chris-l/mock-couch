/* jslint node: true */
'use strict';

module.exports = function(self) {
  return function(req, res, next) {
    // If the database already exists.
    if(self.databases.hasOwnProperty(req.params.db)) {
      res.send(412, {error:'file_exists',reason:'The database could not be created, the file already exists.'});
    }

    // Create the database
    if(!self.databases.hasOwnProperty(req.params.db)) {
      self.databases[req.params.db] = {};
      res.send(201, {ok: true});
      self.emit('PUT', { id : req.params.db, type: 'database' });
    }
    next();
  };
};
