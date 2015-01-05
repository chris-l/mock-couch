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


    // send the changes stream (inject some vars into scope)
    function sendChanges(scope, dbname, res, changes){ 
      return function(){
        // if there are no changes, dont create a readable stream
        if(scope.changes[dbname].length > 0){
          changes = new stream.Readable();
          for(var i in scope.changes[dbname]){
            changes.push(scope.changes[dbname][i]);
          }
          changes.push(null);
          scope.changes[dbname] = [];
          return changes.pipe(res);
        }
      };
    }

    // return the changes stream
    if(db && self.changes[dbname]) {
      res.setHeader('Content-Type', 'application/octet-stream');
      var changes;
      // if continuous, set an interval for sending responses
      if(req.query.feed === 'continuous'){
        setInterval(sendChanges(self, dbname, res, changes), parseInt(req.query.heartbeat) || 1000);
      }
      else{
        return sendChanges(self, dbname, res, changes)();
      }
    }
    else{
      res.send(404, {error:'not_found',reason:'no_db_file'});
    }
  };
};
