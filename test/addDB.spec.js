/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var addDB = require('../lib/addDB');

describe('addDB', function () {
  var mock_mock;

  beforeEach(function () {
    mock_mock = {
      databases : {},
      changes : {},
      sequence : {}
    };
  });

  it('should accept an array and add it as a database', function () {
    addDB.call(mock_mock, 'people', [ { _id : 'an_id', name : 'reimu', lastname : 'hakurei' }, {  name : 'marisa', lastname : 'kirisame', _id : 'other' } ]);
    expect(!!mock_mock.databases.people).toBe(true);
    expect(!!mock_mock.databases.people.an_id).toBe(true);
    expect(mock_mock.databases.people.an_id.name).toBe('reimu');
    expect(!!mock_mock.databases.people.other).toBe(true);
    expect(mock_mock.databases.people.other.lastname).toBe('kirisame');
  });


  it('should accept an array whose elements don\'t have the _id attribute, and add them to the database, by creating them a random id', function () {
    addDB.call(mock_mock, 'people', [ { name : 'reimu', lastname : 'hakurei' }, {  name : 'marisa', lastname : 'kirisame' } ]);
    expect(!!mock_mock.databases.people).toBe(true);
    expect(Object.keys(mock_mock.databases.people).length).toBe(2);
  });

  it('should have rows as an optional parameter to just create an empty database', function () {
    addDB.call(mock_mock, 'empty');
    expect(!!mock_mock.databases.empty).toBe(true);
  });
});

