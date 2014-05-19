/* jslint node: true */
'use strict';
var __ = require('underscore')._;

module.exports = function(self) {
  /**
   * GET method used to show the info of one database
   */
  return function(req, res, next) {
    var db = self.databases[req.params.db];

    if(db) {
      res.send(200, {
        db_name: req.params.db,
        doc_count: __.size(db),
        disk_size: JSON.stringify(db).length,
        compact_running: false,
        disk_format_version: 5,
        doc_del_count: 0, // not supported yet
        instance_start_time: 0,
        purge_seq: 0,
        update_seq: 0
      });
    } else {
      res.send(404, {error:'not_found',reason:'no_db_file'});
    }
    next();
  };
};
