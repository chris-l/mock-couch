/* jslint node: true */
'use strict';
var __ = require('underscore')._;

module.exports = function(self) {
  /**
   * GET method used to show all the documents of a database
   */
  return function(req, res, next) {
    // The mock db object
    var db = self.databases[req.params.db];

    // It creates and format the rows
    var rows = __(db).chain().pairs(db).sortBy(function(i) {
      return i[0];
    }).map(function(data) {
      var id = data[0], doc = __.clone(data[1]);
      doc._id = id;

      // Show the document's content if include_docs=true
      var document = req.query.include_docs === 'true' ? doc : undefined;

      return {
        _id : id,
      key : id,
      value : { rev : doc._rev },
      doc : document
      };
    }).value();

    // Reverse the order if descending=true
    rows = req.query.descending === 'true' ? rows.reverse() : rows;

    res.send(200, {
      total_rows: Object.keys(db).length,
      offset: 0,
      rows: rows
    });
    next();
  };
};
