/* jslint node: true */
'use strict';
var __ = require('underscore')._;

module.exports = function(req, res, rows) {
  var skip      = (req.query.hasOwnProperty('skip') && parseInt(req.query.skip, 10)) || 0,
      limit     = (req.query.hasOwnProperty('limit') && parseInt(req.query.limit, 10)) || false,
      startkey  = req.query.startkey || req.query.start_key || false,
      endkey    = req.query.endkey || req.query.end_key || false,
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
