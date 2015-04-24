/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var all_docs_fn = require('../lib/check_db'),
  mockDB = require('../lib/mockDB');

describe('check_db', function () {
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
        },
        qball : {
          _rev : '9999',
          name : 'cirno'
        }
      })
    };
    mock_mock = {
      emit : dummy_function,
      databases :  db,
      changes : { people : [] },
      sequence : { people : 4 }
    };
    get = all_docs_fn(mock_mock);
  });

  it('should return an error if the database does not exist', function () {
    get({ route : { method : 'GET' }, params : { db : 'nofound' }, query : { } }, res, dummy_function);
    expect(statusCode).toBe(404);
    expect(result.error).toBe('not_found');
    expect(result.reason).toBe('no_db_file');
  });

});
