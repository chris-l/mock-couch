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
    var useReduce     = (view.hasOwnProperty('reduce') && ( !req.query.hasOwnProperty('reduce') || req.query.reduce !== 'false' )),
        useGroup      = (req.query.hasOwnProperty('group') && req.query.group === 'true'),
        includeDocs   = (req.query.hasOwnProperty('include_docs') && req.query.include_docs === 'true'),
        useDescending = (req.query.hasOwnProperty('descending') && req.query.descending === 'true'),
        skip          = (req.query.hasOwnProperty('skip') && parseInt(req.query.skip, 10)) || 0,
        limit         = (req.query.hasOwnProperty('limit') && parseInt(req.query.limit, 10)) || false;

    var rows = [];
    // Execute the map function
    db.forEach(function(doc) {
      var local = Object.seal(__.clone(doc));
      global.emit = function(key, value) {
        if(!/^_design/.test(doc._id)) {
          var result = {id : doc._id, key : key, value : value};
          if(!useReduce && includeDocs) {
            result.doc = doc;
          }
          rows.push(result);
        }
      };
      view.map(local);
    });

    if(!view.hasOwnProperty('reduce') && req.query.hasOwnProperty('reduce') && req.query.reduce === 'true') {
      res.send(400, {
        error: 'query_parse_error',
        reason: 'Reduce is invalid for map-only views.'
      });
      return false;
    }

    if(useReduce && includeDocs) {
      res.send(400, {
        error: 'query_parse_error',
        reason: '`include_docs` is invalid for reduce'
      });
      return false;
    }

    if(!useReduce && useGroup) {
      res.send(400, {
        error: 'query_parse_error',
        reason: 'Invalid use of grouping on a map view.'
      });
      return false;
    }

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
        if(skip > 0 || limit !== false) {
          output = output.splice(skip, limit || output.length - skip);
        }
        res.send(200, { rows : output });
      }());
    }

    if(!useReduce) {
      // Output map array only
      if(useDescending) {
        rows = rows.reverse();
      }
      if(skip > 0 || limit !== false) {
        rows = rows.splice(skip, limit || rows.length - skip);
      }
      res.send(200, { total_rows : rows.length, offset : skip, rows : rows });
    }
    next();
  };
};

