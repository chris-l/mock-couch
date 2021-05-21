/*jslint node: true, indent: 2, nomen  : true */
'use strict';
var createMD5 = require('./createMD5');

module.exports = function (self) {
  /**
   * GET method used to show a generate one or more UUIDs
   */
  return function (req, res) {
    var count, ret, i, seqPrefix;

    count = (req.query && req.query.count) || 1;

    ret = [];

    seqPrefix = self.seqPrefix || createMD5();
    for (i = 0; i < count; i += 1) {
      ret.push(seqPrefix + ('000000' + i).substr(-6, 6));
    }

    res.send(200, {'uuids': ret});
    return self.emit('GET', { type : 'uuids', count : count });
  };
};
