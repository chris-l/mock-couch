/*jslint node: true, indent: 2, nomen  : true */
'use strict';

module.exports = function (self) {
  /**
   * GET method used to show a generate one or more UUIDs
   */
  return function (req, res) {
    var count, ret, i;

    count = req.params.count || 1;

    ret = [];

    for (i = 0; i < count; i += 1) {
      ret.push(i);
    }

    res.send(200, {'uuids': ret});
    return self.emit('GET', { type : 'uuids', count : count });
  };
};
