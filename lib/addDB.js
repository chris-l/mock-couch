/*jslint node: true, indent: 2, nomen  : true */
'use strict';

var createMD5 = require('./createMD5'),
  mockDB = require('./mockDB'),
  __ = require('underscore')._;

module.exports = function (name, arr) {
  var doc, res = [], docs = [], i;

  /**
   * Used to add a database to the mock couch
   * @param {string} name - the name of the database
   * @param {array} arr - array with the rows
   */
  if (!arr.map) {
    return false;
  }
  for (i in arr) {
    if (arr.hasOwnProperty(i)) {
      doc = arr[i];
      doc._id = doc._id || createMD5();
      doc._rev = doc._rev || '1-' + createMD5(JSON.stringify(doc));
      docs[i] = __.clone(doc);
      res[doc._id] = doc;
      delete res[doc._id]._id;
    }
  }

  this.databases[name] = mockDB(res);
  this.changes[name] = [];
  this.sequence[name] = 0;
  for (i in docs) {
    if (docs.hasOwnProperty(i)) {
      doc = docs[i];
      // don't emit changes for _local documents
      if (doc._id.indexOf('_local') !== 0) {
        this.changes[name].push({
          seq     : this.sequence[name],
          id      : doc._id,
          changes : [{
            rev : doc._rev
          }],
          doc     : doc
        });
        this.sequence[name] += 1;
      }
    }
  }
  return this.databases[name];
};

