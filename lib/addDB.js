/* jslint node: true */
'use strict';
var createMD5 = require('./createMD5'),
    mockDB    = require('./mockDB');

module.exports = function(name, arr) {
  /**
   * Used to add a database to the mock couch
   * @param {string} name - the name of the database
   * @param {array} arr - array with the rows
   */
  if(!arr.map) {
    return false;
  }
  var obj = arr.reduce(function(obj, doc) {
    var id = doc._id || createMD5();
    delete doc._id;
    doc._rev = doc._rev || '1-' + createMD5(JSON.stringify(doc));
    obj[id] = doc;
    return obj;
  }, {});
  this.databases[name] = mockDB(obj);
  return this.databases[name];
};

