/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var all_dbs_fn = require('../lib/all_dbs');

describe('_all_dbs', function () {
  var mock_mock, get, result, dummy_function, res;

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
    var db = {
      mikos : {
        miko : {
          _rev : '12345',
          name : 'reimu',
          lastname : 'hakurei'
        },
        player2 : {
          _rev : '334455',
          name : 'sanae',
          lastname : 'kochiya'
        }
      },
      mages : {
        magician : {
          _rev : '67890',
          name : 'marisa',
          lastname : 'kirisame'
        }
      }
    };
    mock_mock = {
      emit : dummy_function,
      databases :  db,
      changes : { people : [] },
      sequence : { people : 2 }
    };
    get = all_dbs_fn(mock_mock);
  });

  it('should get the list of all databases', function () {
    get({ }, res, dummy_function);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('mikos');
    expect(result[1]).toBe('mages');
    delete mock_mock.databases.mages;
    get({ }, res, dummy_function);
    expect(result.length).toBe(1);
  });
});

