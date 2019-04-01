/*jslint node: true, indent: 2, nomen  : true, unparam: true */
'use strict';

module.exports = function (self) {
  return function (req, res, next) {
    res.send(200);
    self.emit('POST', { type : '_session' });
    next();
    return true;
  };
};
