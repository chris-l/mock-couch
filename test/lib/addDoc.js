/* jslint node: true */
'use strict';
var createMD5 = require('./createMD5');

module.exports = function(name, doc) {
  /**
   * Add a document to a database
   * @param {string} name - the name of the database
   * @param {object} doc - object containing the document
   */
  var id = doc._id || createMD5();
  delete doc._id;
  doc._rev = doc._rev || '1-' + createMD5(JSON.stringify(doc));
  this.databases[name][id] = doc;
  this.changes[name].push(JSON.stringify(doc));
  return { id : id, _rev : doc._rev };
};

