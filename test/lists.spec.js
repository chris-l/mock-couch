/*jslint node: true, indent: 2 , nomen : true*/
/*global describe, it, expect, beforeEach, emit, getRow, send, start */
'use strict';
var list_fn = require('../lib/get_list'),
  mockDB = require('../lib/mockDB');

describe('lists', function () {
  var dummy_function, get, headers, mock_mock, res, result, statusCode;
  dummy_function = function (key, value) {
    headers[key] = value;
  };

  res = {
    send: function (status, obj) {
      statusCode = status;
      result = obj;
    },
    setHeader: dummy_function,
    headers: function () {
      return headers;
    }
  };

  beforeEach(function () {
    /*jslint unparam: true*/
    var db = {
      people: mockDB({
        miko: {
          type: 'player',
          _rev: '1-39117a69a5e6572d5935fab3239d309d',
          name: 'reimu',
          lastname: 'hakurei',
          trainer: 'qball',
          money: 20,
          friends: ['player2', 'qball']
        },
        magician: {
          type: 'player',
          _rev: '67890',
          name: 'marisa',
          lastname: 'kirisame',
          trainer: 'qball',
          money: 30,
          friends: ['miko']
        },
        '_design/designer': {
          views: {
            general: {
              map: function (doc) {
                emit(null, doc);
              }
            },
            moneyCount: {
              map: function (doc) {
                emit(doc._id, doc.money);
              },
              reduce: "_sum"
            }
          },
          lists: {
            general: function () {
              return 'It works!';
            },
            contentType: function () {
              start({
                headers: {
                  'Content-Type': 'text/csv'
                }
              });
              return 'It works!';
            },
            queryparams: function (head, req) {
              if (req.query.param1) {
                return 'Param1 is found';
              }
              return 'Param1 not found';
            },
            html: function () {
              send('<html><body><table><tr><th>First Name</th><th>Last Name</th></tr>');
              var row = getRow();
              while (row) {
                send('<tr><td>' + row.name + '</td><td>' + row.lastname + '</td></tr>');
                row = getRow();
              }
              send('</table></body></html>');
            },
            reduceHtml: function () {
              send('<html><body><h1>Total money:</h1><br/>');
              var row = getRow();
              while (row) {
                send('<p>' + row + '</p>');
                row = getRow();
              }
              send('</body></html>');
            }
          }
        }
      })
    };
    /*jslint unparam: false*/
    mock_mock = {
      emit: dummy_function,
      databases: db,
      changes: {people: []},
      sequence: {people: 5}
    };
    headers = {};
    get = list_fn(mock_mock);
  });

  it('should return the text, It works!', function () {
    get({
      route: {method: 'GET'},
      params: {db: 'people', doc: 'designer', name: 'general', listname: 'general'},
      query: {}
    }, res, dummy_function);
    expect(statusCode).toBe(200);
    expect(result).toBe('It works!');
  });

  it('should use content-type application/json by default', function () {
    get({
      route: {method: 'GET'},
      params: {db: 'people', doc: 'designer', name: 'general', listname: 'general'},
      query: {}
    }, res, dummy_function);
    expect(statusCode).toBe(200);
    expect(headers['Content-Type']).toEqual('application/json');
  });

  it('should overwrite a default content-type', function () {
    get({
      route: {method: 'GET'},
      params: {db: 'people', doc: 'designer', name: 'general', listname: 'contentType'},
      query: {}
    }, res, dummy_function);
    expect(statusCode).toBe(200);
    expect(headers['Content-Type']).toEqual('text/csv');
  });

  it('should generate web page with results', function () {
    var expectedResult = '<html><body><table><tr><th>First Name</th><th>Last Name</th></tr>' +
      '<tr><td>marisa</td><td>kirisame</td></tr>' +
      '<tr><td>reimu</td><td>hakurei</td></tr></table></body></html>';
    get({
      route: {method: 'GET'},
      params: {db: 'people', doc: 'designer', name: 'general', listname: 'html'},
      query: {}
    }, res, dummy_function);
    expect(statusCode).toBe(200);
    expect(result).toBe(expectedResult);
  });

  it('should generate web page total money', function () {
    var expectedResult = '<html><body><h1>Total money:</h1><br/><p>50</p></body></html>';
    get({
      route: {method: 'GET'},
      params: {db: 'people', doc: 'designer', name: 'moneyCount', listname: 'reduceHtml'},
      query: {reduce: true}
    }, res, dummy_function);
    expect(statusCode).toBe(200);
    expect(result).toBe(expectedResult);
  });

  it('should returns result based on query parameters', function () {
    get({
      route: {method: 'GET'},
      params: {db: 'people', doc: 'designer', name: 'general', listname: 'queryparams'},
      query: {param1: true}
    }, res, dummy_function);
    expect(statusCode).toBe(200);
    expect(result).toBe('Param1 is found');
  });
});