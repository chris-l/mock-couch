/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var put_db_fn = require('../lib/put_db');

describe('put_db', function () {
  var mock_mock, put_db, result, dummy_function, res;

  dummy_function = function () {
    return;
  };
  /*jslint unparam: true*/
  res = {
    send : function (status, obj) {
      result = obj;
    },
    setHeader : dummy_function
  };
  /*jslint unparam: false*/

  beforeEach(function () {
    mock_mock = {
      emit : dummy_function,
      databases :  { existing : {} },
      changes : { existing : [] },
      sequence : { existing : 0 }
    };
    put_db = put_db_fn(mock_mock);
  });

  it('should allow to create a new database', function () {
    put_db({ params : { db : 'people'} }, res, dummy_function);
    expect(!!mock_mock.databases.people).toBe(true);
    expect(mock_mock.databases.people.constructor === Object).toBe(true);
    expect(result.hasOwnProperty('ok')).toBe(true);
    expect(result.ok).toBe(true);
    expect(result.hasOwnProperty('error')).toBe(false);
  });

  it('should NOT allow to create a database that already exist', function () {
    put_db({ params : { db : 'existing'} }, res, dummy_function);
    expect(result.hasOwnProperty('ok')).toBe(false);
    expect(result.hasOwnProperty('error')).toBe(true);
  });

  it('should NOT allow to create a database with an invalid name', function () {
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

  it('should add an empty changes list for new databases', function () {
    put_db({ params : { db : 'new_db'} }, res, dummy_function);
    expect(mock_mock.changes.new_db.length).toBe(0);
  });
  it('should allow to create a database with special characters', function () {
    put_db({ params: { db: 'abc_$()+-/' } }, res, dummy_function);
    expect(!!mock_mock.databases['abc_$()+-/']).toBe(true);
    expect(result.hasOwnProperty('ok')).toBe(true);
    expect(result.hasOwnProperty('error')).toBe(false);
  });
});

