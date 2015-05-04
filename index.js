/*jslint node: true, indent: 2 */
'use strict';

var restify = require('restify'),
  util = require('util'),
  events = require("events");




function MockCouch(options) {
  var server;

  events.EventEmitter.call(this);
  if (!options) {
    options = {};
  }
  /** The var 'server' contains the restify server */
  server = (function () {
    /*jslint unparam:true*/
    var srv = restify.createServer({
      formatters : {
        'application/json' : function (req, res, body) {
          res.setHeader('srv', 'CouchDB/1.0.1 (Erlang OTP/R13B)');
          res.setHeader('Cache-Control', 'must-revalidate');

          // Check if the client *explicitly* accepts application/json. If not, send text/plain
          var sendPlainText = (req.header('Accept') !== undefined && req.header('Accept').split(/, */).indexOf('application/json') === -1);
          if (sendPlainText) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          }

          return JSON.stringify(body, function (key, val) {
            if (typeof val === 'function') {
              return val.toString();
            }
            return val;
          });
        }
      }
    });
    /*jslint unparam:false*/
    srv.use(restify.bodyParser({ mapParams: false }));
    srv.pre(restify.pre.sanitizePath());
    srv.use(restify.queryParser());

    if (options.keepAlive === false) {
      /*jslint unparam:true*/
      srv.pre(function preventKeepAlive(req, res, next) {
        res.setHeader('Connection', 'close');
        next();
      });
      /*jslint unparam:false*/
    }

    return srv;
  }());

  // This is where the mock databases dwell
  this.databases = {};
  this.changes = {};
  this.sequence = {};

  (function (server, self) {
    var all_dbs, all_docs, get_db, get_changes, get_view, get_doc, put_doc, get_uuids;
    /**
     * Add the routes
     */

    // GET and HEAD _all_dbs
    all_dbs = require('./lib/all_dbs')(self);
    server.get('/_all_dbs', all_dbs);
    server.head('/_all_dbs', all_dbs);

    // GET _uuids
    get_uuids = require('./lib/uuids')(self);
    server.get('/_uuids', get_uuids);

    // PUT a database
    server.put('/:db', require('./lib/put_db')(self));

    // Check if the database exists.
    server.use(require('./lib/check_db')(self));

    // GET, HEAD, and POST _all_docs
    all_docs = require('./lib/all_docs')(self);
    server.get('/:db/_all_docs', all_docs);
    server.head('/:db/_all_docs', all_docs);
    server.post('/:db/_all_docs', all_docs);

    // POST _bulk_docs
    server.post('/:db/_bulk_docs', require('./lib/bulk_docs')(self));

    // GET and HEAD the info of certain database
    get_db = require('./lib/get_db')(self);
    server.get('/:db/', get_db);
    server.head('/:db/', get_db);

    // GET _changes feed
    get_changes = require('./lib/get_changes')(self);
    server.get('/:db/_changes', get_changes);

    // GET and POST a certain view
    get_view = require('./lib/get_view')(self);
    server.get('/:db/_design/:doc/_view/:name', get_view);
    server.post('/:db/_design/:doc/_view/:name', get_view);

    // GET and HEAD a certain document or _design document
    get_doc = require('./lib/get_doc')(self);
    server.get('/:db/_design/:designdoc/', get_doc);
    server.head('/:db/_design/:designdoc/', get_doc);
    server.get('/:db/:doc', get_doc);
    server.head('/:db/:doc', get_doc);

    // PUT and POST a document
    put_doc = require('./lib/save_doc')(self);
    server.put('/:db/:doc', put_doc);
    server.post('/:db/', put_doc);

    // DELETE a document
    server.del('/:db/:doc', require('./lib/delete_doc')(self));

    // DELETE a database
    server.del('/:db', require('./lib/delete_db')(self));
  }(server, this));

  this.addDB = require('./lib/addDB');
  this.addDoc = require('./lib/addDoc');

  this.listen = function () {
    var args = [].slice.call(arguments, 0);
    args[0] = args[0] || 5984;
    return server.listen.apply(server, args);
  };
  this.close = function () {
    return server.close.apply(server, arguments);
  };
}
util.inherits(MockCouch, events.EventEmitter);

module.exports = {
  createServer : function (options) {
    /** Returns a brand new mock couch! */
    return new MockCouch(options);
  }
};
