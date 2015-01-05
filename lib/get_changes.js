/* jslint node: true */
'use strict';
var stream = require('stream');

module.exports = function(self) {
  /**
   * GET method used to show the info of one database
   */
  return function(req, res, next) {
    var dbname = req.params.db;
    var db = self.databases[dbname];

    // return the readable changes stream
    if(db && self.changes[dbname]) {
      res.setHeader('Content-Type', 'application/octet-stream');
      var changes = new stream.Readable();
      for(var i in self.changes[dbname]){
        changes.push(self.changes[dbname][i]);
      }
      changes.push(null);
      return changes.pipe(res);
    }
    else{
      res.send(404, {error:'not_found',reason:'no_db_file'});
    }
  };
};
