/* jslint node: true */
'use strict';

var __ = require('underscore')._;
var obj = {};
Object.defineProperty(obj, '__doc_count', { enumerable : false, get : function() { return Object.keys(this).length; } });
var dummyfunc = function (){};

dummyfunc.prototype = obj;

module.exports = function(obj) {
  var result = new dummyfunc();
  obj = obj || {};
  return __.extend(result, obj);
};
