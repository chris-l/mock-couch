/* jslint node: true */
/* global describe, it, expect, beforeEach, afterEach */
'use strict';

var del_fn = require('../lib/delete');

describe('delete', function() {
  var mock_mock, del;

  var dummy_function = function() { };
  var res = { send : dummy_function, setHeader : dummy_function };

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
   del = del_fn(mock_mock);
  });

  it('should remove a document if you pass the correct _rev as a query parameter', function() {
    del({ params : { db : 'people', doc : 'miko' }, query : {rev : '98089' }, headers : {} }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(true);

    del({ params : { db : 'people', doc : 'miko' }, query : {rev : '' }, headers : {} }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(true);

    del({ params : { db : 'people', doc : 'miko' }, query : {rev : '12345' }, headers : {} }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(false);
  });

  it('should remove a document if you pass the correct _rev as a if-match header', function() {
    del({ params : { db : 'people', doc : 'miko' }, query : {}, headers : { 'if-match' : '"a7777"' } }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(true);

    del({ params : { db : 'people', doc : 'miko' }, query : {}, headers : { 'if-match' : '""' } }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(true);

    del({ params : { db : 'people', doc : 'miko' }, query : {}, headers : { 'if-match' : '"12345"' } }, res, dummy_function);
    expect(!!mock_mock.databases.people.miko).toBe(false);
  });
});
