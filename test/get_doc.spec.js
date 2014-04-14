/* jslint node: true */
/* global describe, it, expect, beforeEach, afterEach */
'use strict';
var get_doc_fn = require('../lib/get_doc');

describe('get_doc', function() {
  var mock_mock, get, result;

  var dummy_function = function() { };
  var res = { send : function(status, obj) { result = obj; }, setHeader : dummy_function };

  beforeEach(function() {
   var db = {
     people : {
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
     }
   };
   mock_mock = { emit : dummy_function, databases :  db };
   get = get_doc_fn(mock_mock);
  });

  it('should get any existing document', function() {
    get({ params : { db : 'people', doc : 'miko' } }, res, dummy_function);
    expect(result._id).toBe('miko');
  });

});
