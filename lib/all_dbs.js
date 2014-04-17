/* jslint node: true */
'use strict';

module.exports = function(self) {
  return function(req, res, next) {
    res.send(200, Object.keys(self.databases));
    next();
    return true;
  };
};
