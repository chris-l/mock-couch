/* jslint node: true */
'use strict';
var __ = require('underscore')._;

module.exports = function(self) {
  /**
   * GET method used to show all the documents of a database
   */
  return function(req, res, next) {
    // The mock db object
    var original = self.databases[req.params.db],
        db       = __.clone(original),
        startkey = req.query.startkey || req.query.start_key || false,
        endkey   = req.query.endkey || req.query.end_key || false,
        skip     = (req.query.hasOwnProperty('skip') && parseInt(req.query.skip, 10)) || 0,
        limit    = (req.query.hasOwnProperty('limit') && parseInt(req.query.limit, 10)) || false;
    var offset = 0, showDocs;

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

    if(!!req.body && !req.body.keys) {
      res.send(400, { error: 'bad_request', reason: 'invalid_json' });
      return false;
    }

    // Filter out the documents using startkey and endkey, if available.
    if((!req.body || !req.body.keys) && (startkey || endkey)) {
      showDocs = (function() {
        var docs = __.sortBy(Object.keys(db), function(i) { return i; });
        docs = req.query.descending === 'true' ? docs.reverse() : docs;
        offset = startkey !== false && docs.indexOf(startkey) > -1 ? docs.indexOf(startkey) : 0;
        return docs.slice(offset, endkey !== false && docs.indexOf(endkey) > -1 ? docs.indexOf(endkey) + 1 : undefined);
      }());
    }

    // If method POST was used, show only the posted keys
    if(req.body && req.body.keys) {
      showDocs = req.body.keys;
    }

    // Default behavior: show all docs
    if((!req.body || !req.body.keys) && startkey === false && endkey === false) {
      showDocs = Object.keys(db);
    }

    // It creates and format the rows
    var rows = __(db).chain().pairs(db).filter(function(doc) {
      return showDocs.indexOf(doc[0]) > -1;
    }).sortBy(function(i) {
      return i[0];
    }).map(function(data) {
      var id = data[0], doc = __.clone(data[1]);
      doc._id = id;

      // Show the document's content if include_docs=true
      var document = req.query.include_docs === 'true' ? doc : undefined;

      return {
        id    : id,
        key   : id,
        value : { rev : doc._rev },
        doc   : document
      };
    }).value();

    // Reverse the order if descending=true
    rows = req.query.descending === 'true' ? rows.reverse() : rows;

    // Use skip and limit if necessary
    if(skip > 0 || limit !== false) {
      offset += skip;
      rows = rows.splice(skip, limit || rows.length - skip);
    }

    res.send(200, {
      total_rows  : original.__doc_count,
      offset      : offset,
      rows        : rows
    });
    next();
  };
};
