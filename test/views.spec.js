/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach, emit */
'use strict';
var view_fn = require('../lib/get_view'),
  save_doc_fn = require('../lib/save_doc'),
  bulk_docs_fn = require('../lib/bulk_docs'),
  mockDB  = require('../lib/mockDB');

describe('views', function () {
  var mock_mock, get, result, dummy_function, res, save_doc, bulk_docs;

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
          type: 'player',
          _rev : '1-39117a69a5e6572d5935fab3239d309d',
          name : 'reimu',
          lastname : 'hakurei',
          trainer: 'qball',
          money: 20,
          friends: ['player2', 'qball']
        },
        magician : {
          type: 'player',
          _rev : '67890',
          name : 'marisa',
          lastname : 'kirisame',
          trainer: 'qball',
          money: 30,
          friends: ['miko']
        },
        player2 : {
          type: 'player',
          _rev : '334455',
          name : 'sanae',
          lastname : 'kochiya',
          trainer: 'miko',
          money: 40,
          friends: ['miko', 'qball']
        },
        qball : {
          type: 'player',
          _rev : '9999',
          name : 'cirno',
          trainer: 'magician',
          money: 50,
          friends : []
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
            },
            countmoney : {
              map : function (doc) {
                emit(null, doc.money);
              },
              reduce : '_sum'
            },
            howMany : {
              map : function (doc) {
                emit(null, doc._id);
              },
              reduce : '_count'
            },
            compoundKeyView: {
              map: function (doc) {
                if (doc.type === 'player') {
                  emit([doc.trainer, doc.friends.length], null);
                }
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
    save_doc = save_doc_fn(mock_mock);
    bulk_docs = bulk_docs_fn(mock_mock);
  });
  /*jslint unparam: false*/

  it('should execute the reduce function by default, with no grouping', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'someview' }, query : { } }, res, dummy_function);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].key).toBe(null);
    expect(result.rows[0].value).toBe('qballqballplayer2player2mikomikomagicianmagician');
  });

  it('should allow to use _sum as the reduce function', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'countmoney' }, query : { } }, res, dummy_function);
    expect(result.rows[0].value).toBe(140);
  });

  it('should allow to use _count as the reduce function', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'howMany' }, query : { } }, res, dummy_function);
    expect(result.rows[0].value).toBe(4);
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

  it('should emit keys ordered after a startkey', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'compoundKeyView' }, query : { startkey : '["qball", 2]' } }, res, dummy_function);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].id).toBe('miko');
    expect(result.rows[0].key[0]).toBe('qball');
    expect(result.rows[0].key[1]).toBe(2);
  });

  it('should emit keys ordered BEFORE a startkey with descending order', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'compoundKeyView' }, query : { startkey : '["qball", 0]', descending : 'true' } }, res, dummy_function);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0].id).toBe('player2');
    expect(result.rows[1].key[0]).toBe('magician');
    expect(result.rows[1].key[1]).toBe(0);
  });

  it('should emit keys ordered AFTER an endkey with descending order', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'compoundKeyView' }, query : { endkey : '["qball", 0]', descending : 'true' } }, res, dummy_function);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0].id).toBe('miko');
    expect(result.rows[1].key[0]).toBe('qball');
    expect(result.rows[1].key[1]).toBe(1);
  });

  it('should emit keys in an start-end key interval', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'compoundKeyView' }, query : { startkey: '["qball", 0]', endkey: '["qball", 1]' } }, res, dummy_function);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].id).toBe('magician');
  });

  it('should NOT emit any keys in an start-end key interval with descending order', function () {
    get({ route : { method : 'GET' }, params : { db : 'people', doc : 'designer', name : 'nullValueView' }, query : { startkey: '["magician", 0]', endkey: '["qball", 2]', descending: true } }, res, dummy_function);
    expect(result.rows.length).toBe(0);
  });

  it('could be added by uploading a design document using http POST', function () {
    save_doc({ route : { method : 'POST' }, params : { db : 'people', designdoc : 'test' }, query : {}, body : { views : { all : { map : "function(doc) { if (doc.money > 30) { emit(doc._id, doc.money); } }" } } } }, res, dummy_function);
    get({ route : { method : 'GET' }, query : {}, params : { db : 'people', doc : 'test', name : 'all' }  }, res, dummy_function);
    expect(result.rows.length).toBe(2);
  });
  it('could be added by uploading a design document using the bulk method', function () {
    bulk_docs({ route : { method : 'POST' }, params : { db : 'people' }, query : {}, body : { docs : [ { _id : '_design/test', views : { all : { map : "function(doc) { if (doc.money > 30) { emit(doc._id, doc.money); } }" } } } ] } }, res, dummy_function);
    get({ route : { method : 'GET' }, query : {}, params : { db : 'people', doc : 'test', name : 'all' }  }, res, dummy_function);
    expect(result.rows.length).toBe(2);
  });
});
