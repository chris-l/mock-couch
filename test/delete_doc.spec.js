/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';

var del_fn = require('../lib/delete_doc');

describe('delete_doc', function () {
  var mock_mock, del, statusCode, result, dummy_function, res;

  dummy_function = function () {
    return;
  };
  res = {
    send : function (status, obj) {
      statusCode = status;
      result = obj;
    },
    setHeader : dummy_function
  };

  beforeEach(function () {
    var db = {
      people : {
        miko : {
          _rev : '12345',
          name : 'reimu',
          lastname : 'hakurei'
        }
      }
    };
    mock_mock = {
      emit : dummy_function,
      databases :  db,
      changes : { people : [] },
      sequence : { people : 1 }
    };
    del = del_fn(mock_mock);
  });

  it('should remove a document if you pass the correct _rev as a query parameter', function () {
    del({ params : { db : 'people', doc : 'miko' }, query : {rev : '98089' }, headers : {} }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(true);

    del({ params : { db : 'people', doc : 'miko' }, query : {rev : '' }, headers : {} }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(true);

    del({ params : { db : 'people', doc : 'miko' }, query : {rev : '12345' }, headers : {} }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(false);
  });

  it('should remove a document if you pass the correct _rev as a if-match header', function () {
    del({ params : { db : 'people', doc : 'miko' }, query : {}, headers : { 'if-match' : '"a7777"' } }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(true);

    del({ params : { db : 'people', doc : 'miko' }, query : {}, headers : { 'if-match' : '""' } }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(true);

    del({ params : { db : 'people', doc : 'miko' }, query : {}, headers : { 'if-match' : '"12345"' } }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(false);
  });

  it('must return the id of the document it just deleted', function () {
    del({ params : { db : 'people', doc : 'miko' }, query : {}, headers : { 'if-match' : '"12345"' } }, res, dummy_function);
    expect(result.id).toBe('miko');
  });

  it('should return an error if the database does not exist', function () {
    del({ params : { db : 'notfound', doc : 'miko' }, query : {}, headers : { 'if-match' : '"12345"' } }, res, dummy_function);
    expect(statusCode).toBe(404);
    expect(result.error).toBe('not_found');
    expect(result.reason).toBe('no_db_file');
  });

  it('should return an error if the document does not exist', function () {
    del({ params : { db : 'people', doc : 'magician' }, query : {}, headers : { 'if-match' : '"12345"' } }, res, dummy_function);
    expect(statusCode).toBe(404);
    expect(result.error).toBe('not_found');
    expect(result.reason).toBe('missing');
  });

  it('should return a document update conflict error if the rev does not match', function () {
    del({ params : { db : 'people', doc : 'miko' }, query : {}, headers : { 'if-match' : '"11111"' } }, res, dummy_function);
    expect(statusCode).toBe(409);
    expect(result.error).toBe('conflict');
    expect(result.reason).toBe('Document update conflict.');
  });

});
