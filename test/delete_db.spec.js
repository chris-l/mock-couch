/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';

var del_fn = require('../lib/delete_db');

describe('delete_db', function () {
  var mock_mock, del, result, dummy_function, res;

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

  it('should remove a database', function () {
    del({ params : { db : 'people' }}, res, dummy_function);
    expect(!!mock_mock.databases.people).toBe(false);
  });

  it('should do nothing if you try to delete an nonexistent database', function () {
    del({ params : { db : 'humans' }}, res, dummy_function);
    expect(!!result.error).toBe(true);
  });
});
