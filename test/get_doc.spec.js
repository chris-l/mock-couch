/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var get_doc_fn = require('../lib/get_doc');

describe('get_doc', function () {
  var mock_mock, get, statusCode, result, dummy_function, res;

  dummy_function = function () {
    return;
  };
  /*jslint unparam: true*/
  res = {
    send : function (status, obj) {
      statusCode = status;
      result = obj;
    },
    setHeader : dummy_function
  };
  /*jslint unparam: false*/

  beforeEach(function () {
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
    mock_mock = {
      emit : dummy_function,
      databases :  db,
      changes : { people : [] },
      sequence : { people : 1 }
    };
    get = get_doc_fn(mock_mock);
  });

  it('should get any existing document', function () {
    get({ params : { db : 'people', doc : 'miko' } }, res, dummy_function);
    expect(result._id).toBe('miko');
  });

  it('should return an error if the database does not exist', function () {
    get({ params : { db : 'nofound', doc : 'miko' } }, res, dummy_function);
    expect(statusCode).toBe(404);
    expect(result.error).toBe('not_found');
    expect(result.reason).toBe('no_db_file');
  });

  it('should return an error if the document does not exist', function () {
    get({ params : { db : 'people', doc : 'notfound' } }, res, dummy_function);
    expect(statusCode).toBe(404);
    expect(result.error).toBe('not_found');
    expect(result.reason).toBe('missing');
  });

});
