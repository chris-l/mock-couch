/* jslint node: true */
'use strict';
var __ = require('underscore')._;

module.exports = function(self) {
  /**
   * GET method used to show a document
   */
  return function(req, res, next) {
    var db = __(self.databases[req.params.db]).chain().pairs().map(function(item) { item[1]._id = item[0]; return item[1]; }).value();
    var view = self.databases[req.params.db]['_design/' + req.params.doc].views[req.params.name];

    var rows = [];
    // Execute the map function
    db.forEach(function(doc) {
      var local = Object.seal(__.clone(doc));
      global.emit = function(key, value) {
        if(!/^_design/.test(doc._id)) {
          rows.push({id : doc._id, key : key, value : value});
        }
      };
      view.map(local);
    });

    // Create flags
    var useReduce = (view.hasOwnProperty('reduce') && ( !req.query.hasOwnProperty('reduce') || req.query.reduce !== 'false' ));

    if(useReduce) {
      // Reduce
      (function() {
        var keys = rows.map(function(row) {
          return [ row.key, row.id ];
        });
        var values = __.pluck(rows, 'value');
        var reduced = view.reduce(keys, values, false);
        res.send(200, { rows : [ { key : null, value : reduced } ] });
      }());
    }


    if(!useReduce) {
      // Output map array only
      res.send(200, { total_rows : rows.length, offset : 0, rows : rows });
    }
    next();
  };
};

