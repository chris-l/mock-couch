/* jslint node: true */
'use strict';
var createMD5 = require('./createMD5'),
    mockDB    = require('./mockDB'),
    __ = require('underscore')._;

module.exports = function(name, arr) {
  /**
   * Used to add a database to the mock couch
   * @param {string} name - the name of the database
   * @param {array} arr - array with the rows
   */
  if(!arr.map) {
    return false;
  }
  var id, doc, res = [], docs = [];
  for(var i in arr){
    doc = arr[i];
    doc._id = doc._id || createMD5();
    doc._rev = doc._rev || '1-' + createMD5(JSON.stringify(doc));
    docs.push(doc);
    res[doc._id] = __.clone(doc);
    delete res[doc._id]._id;
  }
  
  this.databases[name] = mockDB(res);
  this.changes[name] = [];
  this.sequence[name] = 0;
  for(i in docs){
    doc = docs[i];
    // don't emit changes for _local documents
    if(doc._id.indexOf('_local') !== 0){
      this.changes[name].push({
        seq     : this.sequence[name],
        id      : doc._id,
        changes : [{
          rev : doc._rev
        }],
        doc     : doc
      });
      this.sequence[name]++;
    }
  }
  return this.databases[name];
};

