/* jslint node: true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var addDB = require('../lib/addDB'),
    save_doc_fn = require('../lib/save_doc');

describe('save_doc', function() {
  var mock_mock, save_doc, result;

  var dummy_function = function() { };
  var res = { send : function(status, obj) { result = obj; }, setHeader : dummy_function };

  beforeEach(function() {
   var db = {
     people : {
       miko : {
         _rev : '12345',
         name : 'reimu',
         lastname : 'hakurei'
       }
     }
   };
   mock_mock = { emit : dummy_function, databases :  db };
   save_doc = save_doc_fn(mock_mock);
  });

  it('should allow to create a new document', function() {
    save_doc({ params : { db : 'people', doc : 'player2' }, body : { name : 'sanae', lastname : 'kochiya' } }, res, dummy_function);
    expect(!!mock_mock.databases.people.player2).toBe(true);
    expect(mock_mock.databases.people.player2.name).toBe('sanae');
  });

  it('should NOT allow to create a document with the same name of an existing one', function() {
    save_doc({ params : { db : 'people', doc : 'miko' }, body : { name : 'sanae', lastname : 'kochiya' } }, res, dummy_function);
    expect(mock_mock.databases.people.miko.name).toBe('reimu');
  });

  it('should allow to update a document, requiring to pass the current _rev', function() {
    save_doc({ params : { db : 'people', doc : 'miko' }, body : { _rev : '12345', name : 'sanae', lastname : 'kochiya' } }, res, dummy_function);
    expect(mock_mock.databases.people.miko.name).toBe('sanae');
  });

  it('should NOT allow to update a document, if the _rev is wrong', function() {
    save_doc({ params : { db : 'people', doc : 'miko' }, body : { _rev : '99999', name : 'sanae', lastname : 'kochiya' } }, res, dummy_function);
    expect(mock_mock.databases.people.miko.name).toBe('reimu');

    save_doc({ params : { db : 'people', doc : 'miko' }, body : { _rev : null, name : 'sanae', lastname : 'kochiya' } }, res, dummy_function);
    expect(mock_mock.databases.people.miko.name).toBe('reimu');

    save_doc({ params : { db : 'people', doc : 'miko' }, body : { _rev : '', name : 'sanae', lastname : 'kochiya' } }, res, dummy_function);
    expect(mock_mock.databases.people.miko.name).toBe('reimu');

    save_doc({ params : { db : 'people', doc : 'miko' }, body : { _rev : '123456', name : 'sanae', lastname : 'kochiya' } }, res, dummy_function);
    expect(mock_mock.databases.people.miko.name).toBe('reimu');
  });

  it('must return the id of the document it just created', function() {
    save_doc({ params : { db : 'people' }, body : { name : 'cirno' } }, res, dummy_function);
    expect(/^\w+$/.test(result.id)).toBe(true);

    save_doc({ params : { db : 'people', doc : 'player2' }, body : { name : 'sanae', lastname : 'kochiya' } }, res, dummy_function);
    expect(result.id).toBe('player2');
  });

  it('must return the id of the document it just updated', function() {
    save_doc({ params : { db : 'people', doc : 'miko' }, body : { _rev : '12345', name : 'sanae', lastname : 'kochiya' } }, res, dummy_function);
    expect(result.id).toBe('miko');
  });
});

