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

    // Create flags
    var useReduce = (view.hasOwnProperty('reduce') && ( !req.query.hasOwnProperty('reduce') || req.query.reduce !== 'false' )),
        useGroup = (req.query.hasOwnProperty('group') && req.query.group === 'true'),
        includeDocs = (req.query.hasOwnProperty('include_docs') && req.query.include_docs === 'true'),
        useDescending = (req.query.hasOwnProperty('descending') && req.query.descending === 'true');

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

    if(useReduce && !useGroup) {
      // Reduce and no group
      (function() {
        var keys = rows.map(function(row) {
          return [ row.key, row.id ];
        });
        var values = __.pluck(rows, 'value');
        var reduced = view.reduce(keys, values, false);
        res.send(200, { rows : [ { key : null, value : reduced } ] });
      }());
    }

    if(useReduce && useGroup) {
      // Reduce and group
      (function() {
        var groups = __(rows).chain().groupBy('key').pairs().pluck(1).value();
        if(useDescending) {
          groups = groups.reverse();
        }
        var output = groups.map(function(group) {
          var keys = group.map(function(row) {
            return [ row.key, row.id ];
          });
          var values = __.pluck(group, 'value');
          return { key : group[0].key, value : view.reduce(keys, values, false) };
        });
        res.send(200, { rows : output });
      }());
    }

    if(!useReduce) {
      // Output map array only
      if(useDescending) {
        rows = rows.reverse();
      }
      res.send(200, { total_rows : rows.length, offset : 0, rows : rows });
    }
    next();
  };
};

