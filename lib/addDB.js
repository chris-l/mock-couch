/*jslint node: true, indent: 2, nomen  : true */
'use strict';

var createMD5 = require('./createMD5'),
  mockDB = require('./mockDB'),
  R = require('ramda');

module.exports = function (name, arr) {
  var database, changes;

  /**
   * Used to add a database to the mock couch
   * @param {string} name - the name of the database
   * @param {array} arr - array with the rows
   */
  arr = arr || [];
  if (!Array.isArray(arr)) {
    return false;
  }

  // Add an _id and a _rev to each document, if necessary.
  arr = R.map(function (doc) {
    doc._id = doc._id || createMD5();
    doc._rev = doc._rev || '1-' + createMD5(JSON.stringify(doc));
    return doc;
  }, arr);

  // Prepare the database object.
  // Is pretty much the passed array, converted to an object,
  // where each property is the document, indexed by the _id
  database = R.compose(
    R.mapObj(R.omit(['_id'])),
    R.mapObj(R.head),
    R.groupBy(R.prop('_id')),
    R.cloneDeep
  )(arr);

  changes = R.compose(
    R.map.idx(function (doc, index) {
      return {
        seq     : index,
        id      : doc._id,
        changes : [
          { rev : doc._rev }
        ],
        doc : doc
      };
    }),
    R.filter(function (doc) {
      // don't emit changes for _local documents
      return doc._id.indexOf('_local') !== 0;
    }),
    R.cloneDeep
  )(arr);


  this.databases[name] = mockDB(database);
  this.changes[name] = changes;
  if (!this.sequence.hasOwnProperty(name)) {
    Object.defineProperty(this.sequence, name, {
      get : function () {
        return this.changes[name].length + 1; //couchdb sequence starts with 1
      }.bind(this)
    });
  }

  return this.databases[name];
};

