/*jslint node: true, indent: 2 , nomen  : true, evil : true */
'use strict';
var R = require('ramda'),
  createMD5 = require('./createMD5');

module.exports = function (doc) {
  if (doc.views && (!doc.id || (doc.id && doc._id.substr(0, 8) === '_design/'))) {
    Object.keys(doc.views).forEach(function (view) {
      var fn, thisView = doc.views[view];

      if (thisView.hasOwnProperty('map')) {
        fn = 'return ' + thisView.map;
        thisView.map = (new Function(fn))();
      }
      if (thisView.hasOwnProperty('reduce') && thisView.reduce !== '_sum' && thisView.reduce !== '_count') {
        fn = 'return ' + thisView.reduce;
        thisView.reduce = (new Function(fn))();
      }
    });
  }
  return doc;
};

