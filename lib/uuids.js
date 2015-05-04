/*jslint node: true, indent: 2, nomen  : true */
'use strict';
var R = require('ramda');

module.exports = function (self) {
  /**
   * GET method used to show a document
   */
  return function (req, res) {
    var count, ret, i;

    count = req.params.count || 1;

    ret = [];

    for (i = 0; i < count; i += 1) {
      ret.push(i);
    }

    res.send(200, ret);
    return self.emit('GET', { type : 'uuids', count : count });
  };
};
