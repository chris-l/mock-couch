/* jslint node: true */
'use strict';
var __ = require('underscore')._,
    createMD5 = require('./createMD5');

module.exports = function(self) {
  /**
   * PUT and POST method used to add/alter documents
   */
  return function(req, res, next) {
    var dbname = req.params.db;
    var db = self.databases[dbname];
    var doc = req.body;
    var id = doc._id || req.params.doc || createMD5();
    if(!doc.hasOwnProperty('_id')){
      doc._id = id;
    }
    var change = {
      seq     : self.sequence[dbname],
      id      : id,
      changes : [],
      doc     : __.clone(doc)
    };
    var current = db[id] || false;
    if(doc.hasOwnProperty('_id')) {
      delete doc._id;
    }

    // Is a new document
    if(!current) {
      doc._rev = '1-' + createMD5(JSON.stringify(doc));
      db[id] = doc;
      change.doc._rev = doc._rev;
      change.changes.push({ rev : doc._rev });
      // don't emit changes for _local documents
      if(id.indexOf('_local') !== 0){
        self.changes[dbname].push(change);
        self.sequence[dbname]++;
      }
      res.setHeader('ETag', '"' + doc._rev + '"');
      res.send(201, {ok: true, id: id, rev: doc._rev});
    }
 
    // Wrong/missing _rev
    if(!!current && (!doc.hasOwnProperty('_rev') || current._rev !== doc._rev)) {
      res.send(409, {error:'conflict',reason:'Document update conflict.'});
    }

    // Is an update
    if(!!current && current._rev === doc._rev) {
      __.extend(current, doc);

      current._rev = (function(d) {
        var rev = d._rev;
        var rev_num = parseInt(rev.substring(0, rev.indexOf('-')), 10) + 1;
        return rev_num + '-' + createMD5(JSON.stringify(d));
      }(current));

      change.doc._rev = current._rev;
      change.changes.push({ rev : current._rev });
      // don't emit changes for _local documents
      if(id.indexOf('_local') !== 0){
        self.changes[dbname].push(change);
        self.sequence[dbname]++;
      }
      res.setHeader('ETag', '"' + current._rev + '"');
      res.send(201, {ok: true, id: id, rev: current._rev});
    }

    self.emit(req.route.method, { type : 'document', id : id, doc: doc });
    next();
  };
};
