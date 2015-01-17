/*jslint node: true, indent: 2, nomen  : true */
'use strict';
var crypto = require('crypto');

module.exports = function createMD5(data) {
  /**
   * It creates an hex md5 code, from the provided data or from random
   * @param {string} data - The string that is going to be converted to MD5
   */
  data = data || Math.random().toString(36).substring(3);
  return crypto.createHash('md5').update(data).digest("hex");
};

