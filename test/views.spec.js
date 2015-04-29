/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach, emit */
'use strict';
var view_fn = require('../lib/get_view'),
  mockDB  = require('../lib/mockDB');

describe('views', function () {
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

  beforeEach(function () {
    var db = {
      people : mockDB({
        miko : {
          _rev : '1-39117a69a5e6572d5935fab3239d309d',
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
        },
        '_design/designer' : {
          views : {
            someview : {
              map : function (doc) {
                emit(null, { 'id': doc._id });
                emit([doc._id], { 'id': doc._id });
              },
              reduce : function (keys, values, rereduce) {
                return values.reduce(function (a, b) {
                  return a + b.id;
                }, '');
              }
            },
            nullValueView: {
              map: function (doc) {
                emit(doc._id, null);
              }
            }
          },
          _rev : '88888'
        }
      })
    };
    mock_mock = {
      emit : dummy_function,
      databases :  db,
      changes : { people : [] },
      sequence : { people : 5 }
    };
    get = view_fn(mock_mock);
  });
  /*jslint unparam: false*/


  it('should execute the reduce function by default, with no grouping', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'someview' }, query : { } }, res, dummy_function);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].key).toBe(null);
    expect(result.rows[0].value).toBe('qballqballplayer2player2mikomikomagicianmagician');
  });

  it('should be able to use grouping', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'someview' }, query : { group : 'true' } }, res, dummy_function);
    expect(result.rows.length).toBe(5);
    expect(result.rows[0].key).toBe(null);
    expect(result.rows[1].key[0]).toBe('magician');
    expect(result.rows[2].value).toBe('miko');
    expect(result.rows[4].key.length).toBe(1);
  });
  it('should be able to use descending', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'someview' }, query : { group : 'true', descending : 'true' } }, res, dummy_function);
    expect(result.rows[0].key[0]).toBe('qball');
    expect(result.rows[1].key[0]).toBe('player2');
  });
  it('should be able to execute only the map, by disabling reduce', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'someview' }, query : { reduce : 'false' } }, res, dummy_function);
    expect(result.total_rows).toBe(8);
    expect(result.rows[0].id).toBe('magician');
    expect(result.rows[0].key).toBe(null);
    expect(result.rows[1].id).toBe('miko');
    expect(result.rows[1].key).toBe(null);
    expect(result.rows[7].id).toBe('qball');
    //console.log(JSON.stringify(result, null, ' '));
  });
  it('should be able to get only one specific key, by disabling reduce', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'someview' }, query : { reduce : 'false', key : '["qball"]' } }, res, dummy_function);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].key[0]).toBe('qball');
  });
  it('should be able to get only one specific key, by using reduce with group', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'someview' }, query : { group : 'true', key : '["qball"]' } }, res, dummy_function);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].key[0]).toBe('qball');
  });

  it('should be able to handle emitting null values when including docs', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'nullValueView' }, query : { include_docs : 'true' } }, res, dummy_function);
    expect(result.rows.length).toBe(4);
  });
});
