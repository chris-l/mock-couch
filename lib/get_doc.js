/* jslint node: true */
'use strict';

module.exports = function(self) {
  /**
   * GET method used to show a document
   */
  return function(req, res, next) {
    var db = self.databases[req.params.db];
    var doc = db[req.params.doc];
    res.setHeader('ETag', '"' + doc._rev + '"');
    res.send(200, doc);
    self.emit('GET', { id : req.params.doc, doc: doc });
    next();
  };
};
