/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var find_fn = require('../lib/find'),
  mockDB = require('../lib/mockDB');

describe('_find', function () {
  var find, result, statusCode, dummy_function, exercise, res;

  dummy_function = function () {
    return;
  };
  /*jslint unparam: true*/
  res = {
    send: function (status, obj) {
      statusCode = status;
      result = obj;
    },
    setHeader: dummy_function
  };
  /*jslint unparam: false*/

  beforeEach(function () {
    var db = {
      things: mockDB({
        "1": {
          _rev: '1',
          type: 'number',
          isFirst: true
        },
        "2": {
          _rev: '1',
          type: 'number'
        },
        "3": {
          _rev: '1',
          type: 'number'
        },
        a: {
          _rev: '1',
          type: 'letter',
          isFirst: true
        },
        b: {
          _rev: '1',
          type: 'letter'
        },
        c: {
          _rev: '1',
          type: 'letter'
        }
      })
    };
    find = find_fn({
      emit: dummy_function,
      databases: db
    });
  });

  /**
   * Helper function to run the "request".
   * @param {Object} query
   */
  exercise = function (query) {
    find({route: {method: 'POST'}, params: {db: 'things'}, body: query}, res, dummy_function);
  };

  it('should 400 with missing_required_key if selector is missing', function () {
    exercise({});
    expect(statusCode).toBe(400);
    expect(result.docs).toBeUndefined();
    expect(result.error).toBe('missing_required_key');
  });

  it('should 400 with invalid_selector_json if selector is malformed', function () {
    exercise({selector: "foo"});
    expect(statusCode).toBe(400);
    expect(result.docs).toBeUndefined();
    expect(result.error).toBe('invalid_selector_json');
  });

  it('should find all numbers', function () {
    exercise({selector: {type: "number"}});
    expect(statusCode).toBe(200);
    expect(result.docs.length).toBe(3);
    expect(result.docs[0]._id).toBe('1');
    expect(result.docs[1]._id).toBe('2');
    expect(result.docs[2]._id).toBe('3');
  });

  it('should find all letters', function () {
    exercise({selector: {type: "letter"}});
    expect(result.docs.length).toBe(3);
    expect(result.docs[0]._id).toBe('a');
    expect(result.docs[1]._id).toBe('b');
    expect(result.docs[2]._id).toBe('c');
  });

  it('should find all firsts (a and 1)', function () {
    exercise({selector: {isFirst: true}});
    expect(result.docs.length).toBe(2);
    expect(result.docs[0]._id).toBe('1');
    expect(result.docs[1]._id).toBe('a');
  });

  it('should logical-AND all selectors (number)', function () {
    exercise({selector: {type: "number", isFirst: true}});
    expect(result.docs.length).toBe(1);
    expect(result.docs[0]._id).toBe('1');
  });

  it('should logical-AND all selectors (letter)', function () {
    exercise({selector: {type: "letter", isFirst: true}});
    expect(result.docs.length).toBe(1);
    expect(result.docs[0]._id).toBe('a');
  });

  it('should return no documents for a non-existent property', function () {
    exercise({selector: {foo: "bar"}});
    expect(result.docs.length).toBe(0);
  });

  it('should return no documents for a matching plus a non-existent property', function () {
    exercise({selector: {type: "letter", foo: "bar"}});
    expect(result.docs.length).toBe(0);
  });

  it('should return no documents if types do not match', function () {
    exercise({selector: {isFirst: "true"}});
    expect(result.docs.length).toBe(0);
  });
});
