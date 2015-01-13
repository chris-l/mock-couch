/* jslint node: true */
'use strict';
var __       = require('underscore')._,
    doFilter = require('./query_options');

module.exports = function(self) {
  /**
   * GET method used to show all the documents of a database
   */
  return function(req, res, next) {
    var original = self.databases[req.params.db], db = __.clone(original);
    var offset = 0;

    // It creates and format the rows
    var rows = __(db).chain().pairs(db).map(function(data) {
      var id = data[0], doc = __.clone(data[1]);
      doc._id = id;

      // Prepare output
      var output = {
        id    : id,
        key   : id,
        value : { rev : doc._rev }
      };

      // Show the document's content if include_docs=true
      if(req.query.include_docs === 'true') {
        output.doc = doc;
      }
      return output;
    }).value();

    rows = doFilter(req, res, rows);
    res.send(200, {
      total_rows  : original.__doc_count,
      offset      : offset,
      rows        : rows
    });
    self.emit(req.route.method, { type : '_all_docs', database : req.params.db, rows : rows });
    next();
  };
};
