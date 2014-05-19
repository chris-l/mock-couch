/* jslint node: true */
'use strict';


var __ = require('underscore')._;
var obj = {};
Object.defineProperty(obj, '__doc_count', { enumerable : false, get : function() { return __.reduce(this, function(memo, doc) { return memo + (doc._deleted ? 0 : 1); }, 0); } });
var dummyfunc = function (){};

dummyfunc.prototype = obj;

module.exports = function(data) {
  return __.extend(new dummyfunc(), data);
};
