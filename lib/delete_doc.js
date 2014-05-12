/* jslint node: true */
'use strict';

module.exports = function(self) {
  /**
   * DELETE method to delete documents
   */
  return function (req, res, next) {
    var db = self.databases[req.params.db];
    var rev = req.query.rev || ( req.headers['if-match'] && req.headers['if-match'].replace(/"/g, '') ) || false;
    var doc = db[req.params.doc] || false;

    if(!rev || !doc || rev !== doc._rev) {
      res.send(409, {error:'conflict',reason:'Document update conflict.'});
      return false;
    }

    delete db[req.params.doc];
    self.emit('DELETE', { type : 'document', id : req.params.doc });
    res.send(200, {ok: true, id: req.params.doc, rev: ''});
  };
};
