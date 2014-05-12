/* jslint node: true */
'use strict';
var __ = require('underscore')._;

module.exports = function(self) {
  /**
   * GET method used to show a document
   */
  return function(req, res, next) {
    var db = self.databases[req.params.db];
    var name = req.params.hasOwnProperty('designdoc') ? '_design/' + req.params.designdoc : req.params.doc;
    var doc = __.clone(db[name]);
    doc._id = name;
    res.setHeader('ETag', '"' + doc._rev + '"');
    res.send(200, doc);
    self.emit('GET', { type : 'document', id : req.params.doc, doc: doc });
    next();
  };
};
