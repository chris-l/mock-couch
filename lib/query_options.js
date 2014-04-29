/* jslint node: true */
'use strict';
var __ = require('underscore')._;

module.exports = function(req, res, rows) {
  var skip      = (req.query.hasOwnProperty('skip') && parseInt(req.query.skip, 10)) || 0,
      limit     = (req.query.hasOwnProperty('limit') && parseInt(req.query.limit, 10)) || false,
      startkey  = req.query.startkey || req.query.start_key || false,
      endkey    = req.query.endkey || req.query.end_key || false,
      keys      = (req.body && req.body.keys) || (req.query && req.query.keys) || false,
      first     = 0, last;
  // Try to parse startkey
  if(startkey) {
    try {
      startkey = JSON.parse(startkey);
    } catch(e) {
      res.send(400, { error: 'bad_request', reason: 'invalid_json' });
      return false;
    }
  }

  // Try to parse endkey
  if(endkey) {
    try {
      endkey = JSON.parse(endkey);
    } catch(e) {
      res.send(400, { error: 'bad_request', reason: 'invalid_json' });
      return false;
    }
  }

  // Try to parse the query 'keys' parameter
  if(req.query && req.query.keys) {
    try {
      keys = JSON.parse(keys);
    } catch(e) {
      res.send(400, { error: 'bad_request', reason: 'invalid_json' });
      return false;
    }
  }

  if(startkey && keys) {
    res.send(400, { error: 'query_parse_error', reason: '`start_key` is incompatible with `keys`' });
    return false;
  }

  if(endkey && keys) {
    res.send(400, { error: 'query_parse_error', reason: '`end_key` is incompatible with `keys`' });
    return false;
  }

  // This petition requires to filter using 'keys'
  if(keys) {
    rows = keys.map(function(key) {
      return __.find(rows, (function(key) {
        return function(row) { return __.isEqual(row.key, key) || undefined; };
      }(key)));
    });
    rows = rows.filter(function(row) { return row !== undefined; });
  }

  if(startkey) {
    first = rows.reduce(function(a,b,i) {
      return (__.isEqual(b.key, startkey)) ? i : a;
    }, 0);
  }
  if(endkey) {
    last = rows.reduce(function(a,b,i) {
      return (__.isEqual(b.key, endkey)) ? i : a;
    }, 0);
  }

  if(startkey || endkey) {
    rows = rows.slice(first, last);
  }

  if(skip > 0 || limit !== false) {
    rows = rows.splice(skip, limit || rows.length - skip);
  }
  return rows;
};
