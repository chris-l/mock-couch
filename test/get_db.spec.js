/* jslint node: true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var get_db_fn = require('../lib/get_db'),
    mockDB      = require('../lib/mockDB');

describe('get_db', function() {
  var mock_mock, get, statusCode, result;

  var dummy_function = function() { };
  var res = { send : function(status, obj) { statusCode = status; result = obj; }, setHeader : dummy_function };

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
   mock_mock = { emit : dummy_function, databases :  db };
   get = get_db_fn(mock_mock);
  });

  it('should get any existing database', function() {
    get({ params : { db : 'people' } }, res, dummy_function);
    expect(statusCode).toBe(200);
    expect(result.db_name).toBe('people');
    expect(result.doc_count).toBe(3);
  });

  it('should return an error if the database does not exist', function() {
    get({ params : { db : 'nofound' } }, res, dummy_function);
    expect(statusCode).toBe(404);
    expect(result.error).toBe('not_found');
    expect(result.reason).toBe('no_db_file');
  });

});
