/*jslint node: true, indent: 2, nomen  : true */
'use strict';

var __ = require('underscore')._,
  obj = {},
  Dummyfunc;

Object.defineProperty(obj, '__doc_count', {
  enumerable : false,
  get : function () {
    return __.reduce(this, function (memo, doc) {
      return memo + (doc._deleted ? 0 : 1);
    }, 0);
  }
});
Dummyfunc = function () {
  return;
};

Dummyfunc.prototype = obj;

module.exports = function (data) {
  return __.extend(new Dummyfunc(), data);
};
