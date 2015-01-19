/*jslint node: true, indent: 2, nomen  : true */
'use strict';
var R = require('ramda');

module.exports = function (self) {
  /**
   * GET method used to show the info of one database
   */
  return function (req, res, next) {
    var dbname, db, seq;

    dbname = req.params.db;
    db = self.databases[dbname];

    // send the changes stream (inject some vars into scope)
    function sendChanges(scope, dbname, res, req, seq) {
      var change = {};
      return function () {
        var i;
        // if there are no changes, dont create a readable stream
        if (scope.changes[dbname].length > 0) {
          for (i in scope.changes[dbname]) {
            if (scope.changes[dbname].hasOwnProperty(i)) {
              change = R.cloneDeep(scope.changes[dbname][i]);
              // handle include_docs param
              if (req.query.include_docs !== 'true') {
                delete change.doc;
              }
              // handle 'since' sequence number param
              if (change.seq >= seq) {
                seq += 1;
                res.write(JSON.stringify(change));
              }
            }
          }
        }
      };
    }

    // return the changes stream
    if (db && self.changes[dbname]) {
      // set sequence to query param or current seq number
      seq = req.query.since || 0;
      if (seq === 'now') {
        seq = self.sequence[dbname];
      }
      // if continuous, set an interval for sending responses
      if (req.query.feed === 'continuous') {
        setInterval(sendChanges(self, dbname, res, req, seq), parseInt(req.query.heartbeat, 10) || 1000);
      } else {
        sendChanges(self, dbname, res, req, seq)();
        next();
      }
    } else {
      res.send(404, { error : 'not_found', reason : 'no_db_file' });
    }
  };
};
