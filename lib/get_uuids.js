/*jslint node: true, indent: 2, nomen  : true */
'use strict';

module.exports = function (self) {
  /**
   * GET method used to show a generate one or more UUIDs
   */
  return function (req, res) {
    var count, ret, i, seqPrefix;

    count = req.params.count || 1;

    ret = [];

    seqPrefix = self.seqPrefix || '4e17c12963f4bee0e6ec90da54';
    for (i = 0; i < count; i += 1) {
      ret.push(seqPrefix + ('000000' + i).substr(-6, 6));
    }

    res.send(200, {'uuids': ret});
    return self.emit('GET', { type : 'uuids', count : count });
  };
};
