/*jslint node: true, indent: 2, nomen  : true, unparam: true */
'use strict';
var R = require('ramda');

module.exports = function (self) {
  return function (req, res, next) {
    var original;

    if (req.params.db) {
      original = self.databases[req.params.db];

      // return a 404 not found error if the database was not found
      if (!original) {
        return res.send(404, { error : 'not_found', reason : 'no_db_file' });
      }

      req.db = R.cloneDeep(original);
      next();
    }
  };
};

