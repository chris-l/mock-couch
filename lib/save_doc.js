/* jslint node: true */
'use strict';
var __ = require('underscore')._,
    createMD5 = require('./createMD5');

module.exports = function(self) {
  /**
   * PUT and POST method used to add/alter documents
   */
  return function(req, res, next) {
    var db = self.databases[req.params.db];
    var doc = req.body;
    var id = doc._id || req.params.doc || createMD5();
    var current = db[id] || false;
    try { delete doc._id; } catch(e) { }

    if(!current) {
      doc._rev = '1-' + createMD5(JSON.stringify(doc));
      db[id] = doc;
      res.setHeader('ETag', '"' + doc._rev + '"');
      res.send(201, {ok: true, id: id, rev: doc._rev});
    } else if (!!current && current._rev === doc._rev) {
      __.extend(current, doc);

      current._rev = (function(d) {
        var rev = d._rev;
        var rev_num = parseInt(rev.substring(0, rev.indexOf('-')), 10) + 1;
        return rev_num + '-' + createMD5(JSON.stringify(d));
      }(current));

      res.setHeader('ETag', '"' + current._rev + '"');
      res.send(201, {ok: true, id: id, rev: current._rev});
    } else {
      res.send(409, {error:'conflict',reason:'Document update conflict.'});
    }
    self.emit('POST', { id : id, doc: doc });
    next();
  };
};
