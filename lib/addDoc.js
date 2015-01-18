/* jslint node: true */
'use strict';
var createMD5 = require('./createMD5');
var __ = require('underscore')._;

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
  // don't emit changes for _local documents
  if(id.indexOf('_local') !== 0){
    this.changes[name].push({
      seq     : this.sequence[name],
      id      : id,
      changes : [{
        rev : doc._rev
      }],
      doc     : __.clone(doc)
    });
    this.sequence[name]++;
  }
  return { id : id, _rev : doc._rev };
};

