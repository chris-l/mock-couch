/* jslint node: true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var put_db_fn = require('../lib/put_db');

describe('put_db', function() {
  var mock_mock, put_db, result;

  var dummy_function = function() { };
  var res = { send : function(status, obj) { result = obj; }, setHeader : dummy_function };

  beforeEach(function() {
   mock_mock = { emit : dummy_function, databases :  { existing : {} } };
   put_db = put_db_fn(mock_mock);
  });

  it('should allow to create a new database', function() {
    put_db({ params : { db : 'people'} }, res, dummy_function);
    expect(!!mock_mock.databases.people).toBe(true);
    expect(mock_mock.databases.people.constructor === Object).toBe(true);
    expect(result.hasOwnProperty('ok')).toBe(true);
    expect(result.ok).toBe(true);
    expect(result.hasOwnProperty('error')).toBe(false);
  });

  it('should NOT allow to create a database that already exist', function() {
    put_db({ params : { db : 'existing'} }, res, dummy_function);
    expect(result.hasOwnProperty('ok')).toBe(false);
    expect(result.hasOwnProperty('error')).toBe(true);
  });

  it('should NOT allow to create a database with an invalid name', function() {
    put_db({ params : { db : 'UPPER'} }, res, dummy_function);
    expect(!!mock_mock.databases.UPPER).toBe(false);
    expect(result.hasOwnProperty('ok')).toBe(false);
    expect(result.hasOwnProperty('error')).toBe(true);

    put_db({ params : { db : '12test'} }, res, dummy_function);
    expect(!!mock_mock.databases['12test']).toBe(false);
    expect(result.hasOwnProperty('ok')).toBe(false);
    expect(result.hasOwnProperty('error')).toBe(true);

    put_db({ params : { db : 'SomeDb'} }, res, dummy_function);
    expect(!!mock_mock.databases.SomeDb).toBe(false);
    expect(result.hasOwnProperty('ok')).toBe(false);
    expect(result.hasOwnProperty('error')).toBe(true);
  });
});

