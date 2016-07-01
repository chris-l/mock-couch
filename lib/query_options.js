/*jslint node: true, indent: 2 , nomen  : true */
'use strict';
var R = require('ramda'),
  isEqual = require('underscore')._.isEqual,
  keyCompare = require('couch-viewkey-compare');

module.exports = function (req, res, rows, isAllDocs) {
  var skip    = (req.query.hasOwnProperty('skip') && parseInt(req.query.skip, 10)) || 0,
    limit     = (req.query.hasOwnProperty('limit') && parseInt(req.query.limit, 10)) || false,
    startkey  = req.query.startkey || req.query.start_key || false,
    endkey    = req.query.endkey || req.query.end_key || false,
    key       = req.query.key || false,
    keys      = (req.body && req.body.keys) || (req.query && req.query.keys) || false,
    useDescending = (req.query.hasOwnProperty('descending') && req.query.descending === 'true'),
    tempkey;

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

  // Reverse the order and the keys if descending=true
  if (useDescending) {
    rows = rows.reverse();
    tempkey = endkey;
    endkey = startkey;
    startkey = tempkey;
  }

  // This petition requires to filter using 'keys'
  if (keys && !isAllDocs) {
    rows = keys.map(function (key) {
      return R.filter(function (row) {
        return isEqual(row.key, key);
      }, rows);
    });

    rows = rows.reduce(R.union, []);
  }

  if (keys && isAllDocs) {
    rows = keys.map(function (key) {
      var result = R.filter(function (row) {
        return isEqual(row.key, key);
      }, rows);
      console.log(result.length);
      if (result.length > 0) {
        return result;
      }
      return [{
        key   : key,
        error : "not_found"
      }];
    });

    rows = rows.reduce(R.union, []);
  }

  if (startkey && !endkey) {
    rows = rows.filter(function (row) {
      var o = keyCompare(startkey, row.key);
      if (o === keyCompare.descending) {
        return false;
      }

      return true;
    });
  }

  if (endkey && !startkey) {
    rows = rows.filter(function (row) {
      var o = keyCompare(endkey, row.key);
      if (o === keyCompare.ascending) {
        return false;
      }

      return true;
    });
  }

  if (startkey && endkey) {
    rows = rows.filter(function (row) {
      var startKeyOrder = keyCompare(startkey, row.key),
        endKeyOrder = keyCompare(endkey, row.key);

      if ((startKeyOrder === keyCompare.descending) ||
          (endKeyOrder === keyCompare.ascending)) {
        return false;
      }

      return true;
    });
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
