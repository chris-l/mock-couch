/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach, emit */
'use strict';
var addDoc = require('../lib/addDoc'),
  mockDB = require('../lib/mockDB');

describe('addDoc', function () {
  var mock_mock, db, dummy_function;
  dummy_function = function () {
    return;
  };

  beforeEach(function () {
    db = {
      people : mockDB({ })
    };
    mock_mock = { emit : dummy_function, databases : db, changes : { people : [] }, sequence : { people : 0 } };
  });

  it('should accept an object and add it as a document to the database', function () {
    var result = addDoc.call(mock_mock, 'people', { _id : 'an_id', name : 'reimu', lastname : 'hakurei' });
    expect(!!mock_mock.databases.people.an_id).toBe(true);
    expect(result.id).toBe('an_id');
    expect(result._rev.substring(0, 2)).toBe('1-');
  });

  it('should create a random id for a document that does not include one', function () {
    var result = addDoc.call(mock_mock, 'people', { name : 'reimu', lastname : 'hakurei' });
    expect(mock_mock.databases.people.__doc_count).toBe(1);
    expect(!!result.id).toBe(true);
    expect(result._rev.substring(0, 2)).toBe('1-');
  });

  it('should create a random _rev for an object if its not included', function () {
    addDoc.call(mock_mock, 'people', { _id : 'an_id', name : 'reimu', lastname : 'hakurei' });
    expect(!!mock_mock.databases.people.an_id._rev).toBe(true);
    expect(mock_mock.databases.people.an_id._rev.substring(0, 2)).toBe('1-');
  });

  it('should be able to add a view', function () {
    addDoc.call(mock_mock, 'people', { _id : '_design/someview', views : { first : { map : function (doc) { emit(null, doc._id); } } } });
    expect(typeof mock_mock.databases.people['_design/someview'].views.first.map === 'function').toBe(true);
  });
});

