/* jslint node: true */
'use strict';

var restify = require('restify'),
    util = require('util'),
    events = require("events");




function MockCouch () {
  events.EventEmitter.call(this);

  /** The var 'server' contains the restify server */
  var server = (function() {
    var server = restify.createServer({
      formatters : {
        'application/json' : function(req, res, body) {
          res.setHeader('Server', 'CouchDB/1.0.1 (Erlang OTP/R13B)');
          return JSON.stringify(body,function(key, val) {
              if (typeof val === 'function') {
                    return val.toString();
              }
              return val;
          });
        }
      }
    });
    server.use(restify.bodyParser({ mapParams: false }));
    server.pre(restify.pre.sanitizePath());
    server.use(restify.queryParser());
    return server;
  }());

  // This is where the mock databases dwell
  this.databases = {};

  (function (server, self) {
    /**
     * Add the routes
     */

    // GET _all_dbs
    server.get('/_all_dbs', require('./lib/all_dbs')(self));

    // GET _all_docs
    server.get('/:db/_all_docs', require('./lib/all_docs')(self));

    // POST _all_docs
    server.post('/:db/_all_docs', require('./lib/all_docs')(self));

    // POST _bulk_docs
    server.post('/:db/_bulk_docs', require('./lib/bulk_docs')(self));

    // GET the info of certain database
    server.get('/:db/', require('./lib/get_db')(self));

    // GET certain view
    server.get('/:db/_design/:doc/_view/:name', require('./lib/get_view')(self));

    // POST certain view
    server.post('/:db/_design/:doc/_view/:name', require('./lib/get_view')(self));

    var get_doc = require('./lib/get_doc')(self);

    // GET certain _design document
    server.get('/:db/_design/:designdoc/', get_doc);

    // GET certain document
    server.get('/:db/:doc', get_doc);

    // PUT and POST a document
    var put_doc = require('./lib/save_doc')(self);
    server.put('/:db/:doc', put_doc);
    server.post('/:db/', put_doc);

    // PUT a database
    server.put('/:db', require('./lib/put_db')(self));

    // DELETE a document
    server.del('/:db/:doc', require('./lib/delete_doc')(self) );

    // DELETE a database
    server.del('/:db', require('./lib/delete_db')(self) );
  }(server, this));

  this.addDB = require('./lib/addDB');
  this.listen = function() {
    return server.listen.apply(server, arguments);
  };
  this.close = function() {
    return server.close.apply(server, arguments);
  };
}
util.inherits(MockCouch, events.EventEmitter);

module.exports = {
  createServer : function() {
    /** Returns a brand new mock couch! */
    return new MockCouch();
  }
};
