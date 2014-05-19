/* jslint node: true */
'use strict';
var __ = require('underscore')._;

module.exports = function(self) {
  /**
   * GET method used to show a document
   */
  return function(req, res, next) {
    var db = self.databases[req.params.db],
        name, doc;
    if (db) {
      name = req.params.hasOwnProperty('designdoc') ? '_design/' + req.params.designdoc : req.params.doc;
      if (name && name in db) {
        doc = __.clone(db[name]);
        doc._id = name;
        res.setHeader('ETag', '"' + doc._rev + '"');
        res.send(200, doc);
        return self.emit('GET', { type : 'document', id : req.params.doc, doc: doc });
      }
      return res.send(404, {error:'not_found',reason:'missing'});
    }
    res.send(404, {error:'not_found',reason:'no_db_file'});
  };
};
