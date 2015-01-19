/*jslint node: true, indent: 2, nomen  : true */
'use strict';

var R = require('ramda'),
  proto = {};

Object.defineProperty(proto, '__doc_count', {
  enumerable : false,
  get : function () {
    return R.compose(
      R.sum,
      R.values,
      R.mapObj(function (doc) {
        return doc._deleted ? 0 : 1;
      })
    )(this);
  }
});

module.exports = function (data) {
  var properties;

  properties = R.mapObj(function (value) {
    return {
      value : value,
      configurable : true,
      enumerable : true,
      writable : true
    };
  }, data);

  return Object.create(proto, properties);
};
