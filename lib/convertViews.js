/*jslint node: true, indent: 2 , nomen  : true, evil : true */
'use strict';
var R = require('ramda'),
  createMD5 = require('./createMD5');

module.exports = function (doc) {
  if (doc.views && (!doc.id || (doc.id && doc._id.substr(0, 8) === '_design/'))) {
    Object.keys(doc.views).forEach(function (view) {
      var fn;
      if (doc.views[view].hasOwnProperty('map')) {
        fn = 'return ' + doc.views[view].map;
        doc.views[view].map = (new Function(fn))();
      }
      if (doc.views[view].hasOwnProperty('reduce')) {
        fn = 'return ' + doc.views[view].reduce;
        doc.views[view].reduce = (new Function(fn))();
      }
    });
  }
  return doc;
};

