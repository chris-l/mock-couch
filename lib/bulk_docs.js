/*jslint node: true, indent: 2, nomen  : true */
'use strict';

var createMD5 = require('./createMD5');

/**
 * @param self
 * @param {boolean} isBulk If true, acts as the _bulk_docs endpoint, otherwise creates a single document.
 */
module.exports = function (self, isBulk) {
  /**
   * POST method used to modify/insert multiple docs
   */
  return function (req, res, next) {
    var db, bulkDocs;

    db = self.databases[req.params.db];

    function saveDoc(doc) {
      /**
       * Save a document in the database
       * @param {object} doc - The document object that is going to be saved
       */

      // Store the id on its own var, and remove it from the doc
      var id = doc._id;
      delete doc._id;

      // Create the rev
      doc._rev = '1-' + createMD5(JSON.stringify(doc));

      // Save the doc
      db[id] = doc;

      return {id: id, rev: doc._rev};
    }

    function normalizeAndSaveDoc(doc) {

      // is a new document without id
      if (!doc._id) {
        doc._id = createMD5();
        return saveDoc(doc);
      }

      // is a new document with id
      if (doc._id && !db.hasOwnProperty(doc._id)) {
        return saveDoc(doc);
      }

      // is a document to update
      if (doc._rev && doc._id && db.hasOwnProperty(doc._id) && db[doc._id]._rev === doc._rev) {
        return saveDoc(doc);
      }

      return { id : doc._id, error : 'conflict', reason : 'Document update conflict.' };
    }

    if (!req.body || (isBulk && !req.body.docs)) {
      res.send(400, { error: 'bad_request', reason: 'invalid_json' });
      return false;
    }

    if (isBulk) {
      bulkDocs = req.body.docs.map(normalizeAndSaveDoc);
      res.send(201, bulkDocs);
      self.emit('POST', { type : '_bulk_docs', docs : bulkDocs });
    } else {
      res.send(201, normalizeAndSaveDoc(req.body));
    }

    next();
  };
};
