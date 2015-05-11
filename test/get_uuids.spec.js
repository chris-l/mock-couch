/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var get_uuids_fn = require('../lib/get_uuids');

describe('get_uuids', function () {
  var mock_mock, get, custom_get, custom_mock, statusCode, result, dummy_function, res;

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
    mock_mock = {
      emit : dummy_function,
      databases :  {},
      changes : { people : [] },
      sequence : { people : 1 }
    };
    get = get_uuids_fn(mock_mock);
    custom_mock = {
      databases: {},
      emit : dummy_function,
      seqPrefix: "4e17c12963f4bee0e6ec90da55"
    };
    custom_get = get_uuids_fn(custom_mock);
  });

  it('should get a single uuid', function () {
    get({ params : {} }, res, dummy_function);
    expect(result.uuids.length).toBe(1);
    expect(result.uuids[0]).toEqual("4e17c12963f4bee0e6ec90da54000000");
    expect(statusCode).toBe(200);
  });

  it('should get multiple uuids', function () {
    get({ params : {"count": 3} }, res, dummy_function);
    expect(result.uuids.length).toBe(3);
    expect(result.uuids[0]).toEqual("4e17c12963f4bee0e6ec90da54000000");
    expect(result.uuids[1]).toEqual("4e17c12963f4bee0e6ec90da54000001");
    expect(result.uuids[2]).toEqual("4e17c12963f4bee0e6ec90da54000002");
    expect(statusCode).toBe(200);
  });

  it('should allow a custom prefix', function () {
    custom_get({ params : {} }, res, dummy_function);
    expect(result.uuids.length).toBe(1);
    expect(result.uuids[0]).toEqual("4e17c12963f4bee0e6ec90da55000000");
    expect(statusCode).toBe(200);
  });

});