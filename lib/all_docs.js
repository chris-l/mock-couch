/*jslint node: true, indent: 2 */
'use strict';
var R = require('ramda'),
  doFilter = require('./query_options');

module.exports = function (self) {
  /**
   * GET method used to show all the documents of a database
   */
  return function (req, res, next) {
    var original, offset, rows, db;

    original = self.databases[req.params.db];
    db = R.cloneDeep(original);
    offset = 0;

    // It creates and format the rows
    rows = R.compose(
      R.map(function (data) {
        var id, output, doc;

        id = data[0];
        doc = R.cloneDeep(data[1]);
        doc._id = id;

        // Prepare output
        output = {
          id    : id,
          key   : id,
          value : { rev : doc._rev }
        };

        // Show the document's content if include_docs=true
        if (req.query.include_docs === 'true') {
          output.doc = doc;
        }
        return output;
      }),
      R.toPairs
    )(db);

    rows = doFilter(req, res, rows, true);
    res.send(200, {
      total_rows  : original.__doc_count,
      offset      : offset,
      rows        : rows
    });
    self.emit(req.route.method, { type : '_all_docs', database : req.params.db, rows : rows });
    next();
  };
};
