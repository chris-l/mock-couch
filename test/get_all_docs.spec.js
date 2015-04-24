/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var all_docs_fn = require('../lib/all_docs'),
  mockDB = require('../lib/mockDB');

describe('_all_docs', function () {
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

  it('should get the list of all documents', function () {
    get({ route : { method : 'GET' }, params : { db : 'people' }, query : { } }, res, dummy_function);
    expect(result.total_rows).toBe(4);

    // alphabetical order
    expect(result.rows[0].id).toBe('magician');
    expect(result.rows[1].id).toBe('miko');
    expect(result.rows[2].id).toBe('player2');
  });

  it('should invert the order if "descending" was set to true', function () {
    get({ route : { method : 'GET' }, params : { db : 'people' }, query : { descending : 'true' } }, res, dummy_function);

    // inverse alphabetical order
    expect(result.rows[0].id).toBe('qball');
    expect(result.rows[1].id).toBe('player2');
    expect(result.rows[2].id).toBe('miko');
    expect(result.rows[3].id).toBe('magician');
  });

  it('should include the documents if "include_docs" was set to true', function () {
    get({ route : { method : 'GET' }, params : { db : 'people' }, query : { include_docs : 'true' } }, res, dummy_function);
    expect(!!result.rows[0].doc).toBe(true);
    expect(result.rows[0].doc.name).toBe('marisa');
    expect(result.rows[0].doc._id).toBe('magician');
  });

  it('should NOT include the documents if "include_docs" was not used', function () {
    get({ route : { method : 'GET' }, params : { db : 'people' }, query : { } }, res, dummy_function);
    expect(!!result.rows[0].doc).toBe(false);

    get({ route : { method : 'GET' }, params : { db : 'people' }, query : { include_docs : 'false' } }, res, dummy_function);
    expect(!!result.rows[0].doc).toBe(false);

    get({ route : { method : 'GET' }, params : { db : 'people' }, query : { include_docs : '' } }, res, dummy_function);
    expect(!!result.rows[0].doc).toBe(false);
  });

  it('should limit the list if startkey and/or endkey is used', function () {
    get({ route : { method : 'GET' }, params : { db : 'people' }, query : { startkey : '"miko"' } }, res, dummy_function);
    expect(result.rows[0].id).toBe('miko');
    expect(result.rows[1].id).toBe('player2');

    get({ route : { method : 'GET' }, params : { db : 'people' }, query : { startkey : '"miko"', endkey : '"qball"' } }, res, dummy_function);
    expect(result.rows[0].id).toBe('miko');

    get({ route : { method : 'GET' }, params : { db : 'people' }, query : { endkey : '"player2"' } }, res, dummy_function);
    expect(result.rows.length).toBe(3);

    get({ route : { method : 'GET' }, params : { db : 'people' }, query : { endkey : '"miko"' } }, res, dummy_function);
    expect(result.rows[1].id).toBe('miko');
    expect(result.rows.length).toBe(2);

    get({ route : { method : 'GET' }, params : { db : 'people' }, query : { descending : 'true', startkey : '"qball"', endkey : '"miko"' } }, res, dummy_function);
    expect(result.rows.length).toBe(3);
    expect(result.rows[0].id).toBe('qball');
    expect(result.rows[1].id).toBe('player2');
    expect(result.rows[2].id).toBe('miko');
  });

  it('must allow to specify which documents I want by passing the keys using POST', function () {
    get({ route : { method : 'POST' }, params : { db : 'people' }, query : { }, body : { keys : [ 'miko', 'qball' ] } }, res, dummy_function);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0].id).toBe('miko');
    expect(result.rows[1].id).toBe('qball');
  });
});
