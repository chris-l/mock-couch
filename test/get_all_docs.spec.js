/* jslint node: true */
/* global describe, it, expect, beforeEach, afterEach */
'use strict';
var all_docs_fn = require('../lib/all_docs'),
    mockDB      = require('../lib/mockDB');

describe('_all_docs', function() {
  var mock_mock, get, result;

  var dummy_function = function() { };
  var res = { send : function(status, obj) { result = obj; }, setHeader : dummy_function };

  beforeEach(function() {
   var db = {
     people : mockDB({
       miko : {
         _rev : '12345',
         name : 'reimu',
         lastname : 'hakurei'
       },
       magician : {
         _rev : '67890',
         name : 'marisa',
         lastname : 'kirisame'
       },
       player2 : {
         _rev : '334455',
         name : 'sanae',
         lastname : 'kochiya'
       }
     })
   };
   mock_mock = { emit : dummy_function, databases : db };
   get = all_docs_fn(mock_mock);
  });

  it('should get the list of all documents', function() {
    get({ params : { db : 'people' }, query : { } }, res, dummy_function);
    expect(result.total_rows).toBe(3);

    // alphabetical order
    expect(result.rows[0]._id).toBe('magician');
    expect(result.rows[1]._id).toBe('miko');
    expect(result.rows[2]._id).toBe('player2');
  });

  it('should invert the order if "descending" was set to true', function() {
    get({ params : { db : 'people' }, query : { descending : 'true' } }, res, dummy_function);

    // inverse alphabetical order
    expect(result.rows[2]._id).toBe('magician');
    expect(result.rows[1]._id).toBe('miko');
    expect(result.rows[0]._id).toBe('player2');
  });

  it('should include the documents if "include_docs" was set to true', function() {
    get({ params : { db : 'people' }, query : { include_docs : 'true' } }, res, dummy_function);
    expect(!!result.rows[0].doc).toBe(true);
    expect(result.rows[0].doc.name).toBe('marisa');
    expect(result.rows[0].doc._id).toBe('magician');
  });

  it('should NOT include the documents if "include_docs" was not used', function() {
    get({ params : { db : 'people' }, query : { } }, res, dummy_function);
    expect(!!result.rows[0].doc).toBe(false);

    get({ params : { db : 'people' }, query : { include_docs : 'false' } }, res, dummy_function);
    expect(!!result.rows[0].doc).toBe(false);

    get({ params : { db : 'people' }, query : { include_docs : '' } }, res, dummy_function);
    expect(!!result.rows[0].doc).toBe(false);
  });

});
