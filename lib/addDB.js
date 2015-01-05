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
    id = doc._id || createMD5();
    doc._rev = doc._rev || '1-' + createMD5(JSON.stringify(doc));
    docs[i] = __.clone(doc);
    res[id] = doc;
    delete res[id]._id;
  }
  
  this.databases[name] = mockDB(res);
  this.changes[name] = [];
  for(i in docs){
    this.changes[name].push(JSON.stringify(docs[i]));
  }
  return this.databases[name];
};

