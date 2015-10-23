/*jslint node: true, indent: 2, nomen  : true */
'use strict';
var R = require('ramda');

module.exports = function (self) {
  /**
   * GET method used to show the info of one database
   */
  return function (req, res, next) {
    var dbname, db, seq, heartbeat, stringify;

    dbname = req.params.db;
    db = self.databases[dbname];
    stringify = R.rPartial(JSON.stringify.bind(JSON), null, '');
    heartbeat = req.query.hasOwnProperty('heartbeat') ?
        parseInt(req.query.heartbeat, 10) : 1000;

    // Send the changes stream (inject some vars into scope)
    function sendChanges(scope, dbname, res, req, seq) {

      return function () {
        R.compose(
          R.forEach(function (o) {
            res.write(o + '\n'); //couchdb changes are split by newline
          }),
          R.map(stringify),
          R.reduce(function (list, change) {

            // Handle include_docs param
            if (req.query.include_docs !== 'true') {
              delete change.doc;
            }

            // Handle 'since' sequence number param
            if (change.seq >= seq) {
              seq += 1;
              list.push(change);
            }

            return list;
          }, []),

          R.map(R.cloneDeep)
        )(scope.changes[dbname]);
      };
    }

    if (!(db && self.changes[dbname])) {
      res.send(404, { error : 'not_found', reason : 'no_db_file' });
      return;
    }

    // Set sequence to query param or current seq number
    seq = req.query.since || 0;
    if (seq === 'now') {
      seq = self.sequence[dbname];
    }

    // Just return the changes if is not continuous.
    if (req.query.feed !== 'continuous') {
      sendChanges(self, dbname, res, req, seq)();
      next();
      return;
    }

    // If continuous, set an interval for sending responses
    setInterval(sendChanges(self, dbname, res, req, seq), heartbeat);
  };
};
