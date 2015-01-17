/*jslint node: true, indent: 2, nomen  : true */
'use strict';

module.exports = function (self) {
  /**
   * DELETE method to delete documents
   */
  return function (req, res, next) {

    if (!self.databases.hasOwnProperty(req.params.db)) {
      res.send(404, { error : 'not_found', reason : 'missing' });
      return false;
    }

    delete self.databases[req.params.db];
    self.emit('DELETE', { type : 'database', database : req.params.db });
    res.send(200, {ok: true});
    next();
  };
};
