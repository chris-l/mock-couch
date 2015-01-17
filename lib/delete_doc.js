/*jslint node: true, indent: 2, nomen  : true, unparam: true */
'use strict';

module.exports = function (self) {
  /**
   * DELETE method to delete documents
   */
  return function (req, res, next) {
    var db, rev, doc;

    db = self.databases[req.params.db];
    if (db) {
      rev = req.query.rev || (req.headers['if-match'] && req.headers['if-match'].replace(/"/g, '')) || false;
      doc = db[req.params.doc] || false;

      if (!doc) {
        res.send(404, { error : 'not_found', reason : 'missing' });
        return false;
      }
      if (!rev || rev !== doc._rev) {
        res.send(409, { error : 'conflict', reason : 'Document update conflict.' });
        return false;
      }

      delete db[req.params.doc];
      self.emit('DELETE', { type : 'document', id : req.params.doc });
      return res.send(200, { ok : true, id : req.params.doc, rev : '' });
    }
    res.send(404, { error : 'not_found', reason : 'no_db_file' });
  };
};
