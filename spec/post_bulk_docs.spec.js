/*jslint node: true, indent: 2 , nomen  : true */
/*global describe, it, expect, beforeEach, afterEach */
'use strict';
var bulk_docs_fn = require('../lib/bulk_docs'),
  mockDB = require('../lib/mockDB');

describe('_bulk_docs', function () {
  var mock_mock, bulkDocs, result, people, dummy_function, res;

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
        nineball : {
          _rev : '9999',
          name : 'cirno'
        }
      })
    };
    mock_mock = {
      emit : dummy_function,
      databases :  db,
      changes : { people : [] },
      sequence : { people : 3 }
    };
    bulkDocs = bulk_docs_fn(mock_mock);
    people = mock_mock.databases.people;
  });

  it('should be able to create several documents', function () {
    bulkDocs({ params : { db : 'people' }, body : { docs : [ { _id : 'player2', name : 'sanae', lastname : 'kochiya' }, { name : 'chen' }, { _id: 'moonbunny', name : 'reisen', nickname : 'udonge' }] } }, res, dummy_function);
    expect(people.__doc_count).toBe(6);
    expect(!!people.player2).toBe(true);
    expect(people.moonbunny.nickname).toBe('udonge');
    expect(people[result[1].id].name).toBe('chen');
  });

  it('should be able to update documents, if the valid rev is passed', function () {
    bulkDocs({ params : { db : 'people' }, body : { docs : [ { _id : 'miko', name : 'sanae', lastname : 'kochiya' }, { _id : 'magician', _rev : '67890', name : 'patchouli', lastname : 'knowledge'  }, { _id: 'nineball', _rev : '9999', name : 'cirno', lastname : 'hakurei' }] } }, res, dummy_function);
    expect(people.__doc_count).toBe(3);
    expect(people.miko.name).toBe('reimu');
    expect(people.miko.lastname).toBe('hakurei');
    expect(people.magician.name).toBe('patchouli');
    expect(people.magician.lastname).toBe('knowledge');
    expect(people.nineball.name).toBe('cirno');
    expect(people.nineball.lastname).toBe('hakurei');
    expect(!!result[0].error).toBe(true);
    expect(!!result[1].error).toBe(false);
    expect(!!result[2].error).toBe(false);
  });
});

