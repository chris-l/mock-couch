/*jslint node: true, indent: 2, nomen  : true, unparam: true */
'use strict';

module.exports = function (self) {
  /**
   * GET method used to show the info of one database
   */
  return function (req, res, next) {
    var db = self.databases[req.params.db];

    if (db) {
      return res.send(200, {
        db_name: req.params.db,
        doc_count: db.__doc_count,
        disk_size: JSON.stringify(db).length,
        compact_running: false,
        disk_format_version: 5,
        doc_del_count: 0, // not supported yet
        instance_start_time: Date.now(),
        purge_seq: 0,
        update_seq: 0
      });
    }
    res.send(404, { error : 'not_found', reason : 'no_db_file' });
  };
};
