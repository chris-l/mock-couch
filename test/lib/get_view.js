/* jslint node: true */
'use strict';
var __       = require('underscore')._,
    doFilter = require('./query_options');

module.exports = function(self) {
  /**
   * GET method used to show a document
   */
  return function(req, res, next) {
    var db = __(self.databases[req.params.db]).chain().pairs().sortBy(function(i) { return i[0]; }).map(function(item) { item[1]._id = item[0]; return item[1]; }).value();
    var view = self.databases[req.params.db]['_design/' + req.params.doc].views[req.params.name];

    // Create flags
    var useReduce     = (view.hasOwnProperty('reduce') && ( !req.query.hasOwnProperty('reduce') || req.query.reduce !== 'false' )),
        useGroup      = (req.query.hasOwnProperty('group') && req.query.group === 'true'),
        includeDocs   = (req.query.hasOwnProperty('include_docs') && req.query.include_docs === 'true'),
        skip          = (req.query.hasOwnProperty('skip') && parseInt(req.query.skip, 10)) || 0;

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
        rows = rows.reverse();
        var keys = rows.map(function(row) {
          return [ row.key, row.id ];
        });
        var values = __.pluck(rows, 'value');
        var reduced = view.reduce(keys, values, false);
        var output = { rows : [ { key : null, value : reduced } ] };
        self.emit(req.route.method, {
          type      : 'view',
          name      : '_design/' + req.params.doc,
          group     : false,
          reduce    : true,
          database  : req.params.db,
          view      : req.params.name,
          output    : output
        });
        res.send(200, output);
      }());
    }

    if(useReduce && useGroup) {
      // Reduce and group
      (function() {
        var groups = __(rows).chain().groupBy(function(row) {
          var key = row.hasOwnProperty('key') ? row.key : '';
          if(typeof key === 'object' && key !== null) {
            key = JSON.stringify(key);
          }
          return key;
        }).pairs().pluck(1).value();
        var output = groups.map(function(group) {
          var keys = group.map(function(row) {
            return [ row.key, row.id ];
          });
          var values = __.pluck(group, 'value');
          return { key : group[0].key, value : view.reduce(keys, values, false) };
        });
        output = doFilter(req, res, output);
        self.emit(req.route.method, {
          type      : 'view',
          name      : '_design/' + req.params.doc,
          group     : true,
          reduce    : true,
          database  : req.params.db,
          view      : req.params.name,
          output    : output
        });
        res.send(200, { rows : output });
      }());
    }

    if(!useReduce) {
      // Output map array only
      rows = doFilter(req, res, rows);
      self.emit(req.route.method, {
        type      : 'view',
        name      : '_design/' + req.params.doc,
        group     : false,
        reduce    : false,
        database  : req.params.db,
        view      : req.params.name,
        output    : rows
      });
      res.send(200, { total_rows : rows.length, offset : skip, rows : rows });
    }
    next();
  };
};

