/*jslint node: true, indent: 2, nomen  : true, unparam: true */
'use strict';

module.exports = function (self) {
  return function (req, res, next) {
    var dbs = Object.keys(self.databases);
    res.send(200, dbs);
    self.emit('GET', { type : '_all_dbs', databases : dbs });
    next();
    return true;
  };
};
