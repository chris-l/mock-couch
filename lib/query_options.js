/*jslint node: true, indent: 2 , nomen  : true */
'use strict';
var R = require('ramda'),
  isEqual = require('underscore')._.isEqual;

module.exports = function (req, res, rows) {
  var skip    = (req.query.hasOwnProperty('skip') && parseInt(req.query.skip, 10)) || 0,
    limit     = (req.query.hasOwnProperty('limit') && parseInt(req.query.limit, 10)) || false,
    startkey  = req.query.startkey || req.query.start_key || false,
    endkey    = req.query.endkey || req.query.end_key || false,
    key       = req.query.key || false,
    keys      = (req.body && req.body.keys) || (req.query && req.query.keys) || false,
    useDescending = (req.query.hasOwnProperty('descending') && req.query.descending === 'true'),
    first     = 0,
    last;

  // Try to parse startkey
  if (startkey) {
    try {
      startkey = JSON.parse(startkey);
    } catch (e) {
      res.send(400, { error: 'bad_request', reason: 'invalid_json' });
      return false;
    }
  }

  // Try to parse endkey
  if (endkey) {
    try {
      endkey = JSON.parse(endkey);
    } catch (e) {
      res.send(400, { error: 'bad_request', reason: 'invalid_json' });
      return false;
    }
  }

  // Try to parse key
  if (key) {
    try {
      key = JSON.parse(key);
    } catch (e) {
      res.send(400, { error: 'bad_request', reason: 'invalid_json' });
      return false;
    }
  }

  // Try to parse the query 'keys' parameter
  if (req.query && req.query.keys) {
    try {
      keys = JSON.parse(keys);
    } catch (e) {
      res.send(400, { error: 'bad_request', reason: 'invalid_json' });
      return false;
    }
  }

  if (startkey && keys) {
    res.send(400, { error: 'query_parse_error', reason: '`start_key` is incompatible with `keys`' });
    return false;
  }

  if (endkey && keys) {
    res.send(400, { error: 'query_parse_error', reason: '`end_key` is incompatible with `keys`' });
    return false;
  }

  // Sort rows
  rows = R.sortBy(function (row) {
    var k = row.key || '';
    if (typeof k === 'object' && k !== null) {
      k = JSON.stringify(k);
    }
    return k;
  }, rows);

  // Reverse the order if descending=true
  if (useDescending) {
    rows = rows.reverse();
  }

  // This petition requires to filter using 'keys'
  if (keys) {
    rows = keys.map(function (key) {
      return R.find((function (key) {
        return function (row) { return isEqual(row.key, key) || undefined; };
      }(key)), rows);
    });
    rows = rows.filter(function (row) { return row !== undefined; });
  }

  if (startkey) {
    first = rows.reduce(function (a, b, i) {
      return a > -1 ? a : ((isEqual(b.key, startkey)) ? i : a);
    }, -1);
  }
  if (endkey) {
    last = rows.reduce(function (a, b, i) {
      return (isEqual(b.key, endkey)) ? i : a;
    }, 0);
  }

  if (startkey || endkey) {
    rows = rows.slice(first, last !== undefined ? last + 1 : undefined);
  }

  if (key) {
    rows = rows.filter(function (x) {
      return isEqual(x.key, key);
    });
  }

  if (skip > 0 || limit !== false) {
    rows = rows.splice(skip, limit || rows.length - skip);
  }
  return rows;
};
