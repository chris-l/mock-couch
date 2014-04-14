/* jslint node: true */
'use strict';
var __ = require('underscore')._;

module.exports = function(self) {
  /**
   * GET method used to show a document
   */
  return function(req, res, next) {
    var db = self.databases[req.params.db];
    var doc = __.clone(db[req.params.doc]);
    doc._id = req.params.doc;
    res.setHeader('ETag', '"' + doc._rev + '"');
    res.send(200, doc);
    self.emit('GET', { id : req.params.doc, doc: doc });
    next();
  };
};
