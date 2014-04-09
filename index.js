var __ = require('underscore')._,
    restify = require('restify'),
    util = require('util'),
    crypto = require('crypto');


function createMD5(data) {
  /**
   * It creates an hex md5 code, from the provided data or from random
   */
  data = data || Math.random().toString(36).substring(3);
  return crypto.createHash('md5').update(data).digest("hex");
}

function mockCouch () {

  /** The var 'server' contains the restify server */
  var server = (function() {
    var server = restify.createServer({
      formatters : {
        'application/json' : function(req, res, body) {
          res.setHeader('Server', 'CouchDB/1.0.1 (Erlang OTP/R13B)');
          return JSON.stringify(body);
        }
      }
    });
    server.use(restify.bodyParser({ mapParams: false }));
    server.pre(restify.pre.sanitizePath());
    server.use(restify.queryParser());
    return server;
  }());

  // this is this here, but in some other places, its not.  
  var self = this;

  // This is where the mock databases dwell
  this.databases = {};


  /**
   * GET method used to show all the documents of a database
   */
  server.get('/:db/_all_docs', function(req, res, next) {
    // The mock db object
    var db = self.databases[req.params.db];

    // It creates and format the rows
    var rows = __(db).chain().pairs(db).sortBy(function(i) {
      return i[0];
    }).map(function(data) {
      var id = data[0], doc = data[1];

      // Show the document's content if include_docs=true
      var document = req.query.include_docs === 'true' ? doc : undefined;

      return {
        _id : id,
        key : id,
        value : { rev : doc._rev },
        doc : document
      };
    }).value();

    // Reverse the order if descending=true
    rows = req.query.descending === 'true' ? rows.reverse() : rows;

    res.send(200, {
      total_rows: Object.keys(db).length,
      offset: 0,
      rows: rows
    });
    next();
  });


  /**
   * GET method used to show a document
   */
  server.get('/:db/:doc', function(req, res, next) {
    var db = self.databases[req.params.db];
    var doc = db[req.params.doc];
    res.setHeader('ETag', '"' + doc._rev + '"');
    res.send(200, doc);
    next();
  });


  /**
   * PUT method used to add/alter documents
   */
  var put_doc = function(req, res, next) {
    var db = self.databases[req.params.db];
    var doc = req.body;
    var id = doc._id || req.params.doc || createMD5();
    var current = db[id] || false;
    try { delete doc._id; } catch(e) { }

    if(!current) {
      doc._rev = '1-' + createMD5(JSON.stringify(doc));
      db[id] = doc;
      res.setHeader('ETag', '"' + doc._rev + '"');
      res.send(201, {ok: true, id: id, rev: doc._rev});
    } else if (!!current && current._rev === doc._rev) {
      __.extend(current, doc);

      current._rev = (function(d) {
        var rev = d._rev;
        var rev_num = parseInt(rev.substring(0, rev.indexOf('-')), 10) + 1;
        return rev_num + '-' + createMD5(JSON.stringify(d));
      }(current));

      res.setHeader('ETag', '"' + current._rev + '"');
      res.send(201, {ok: true, id: id, rev: current._rev});
    } else {
      res.send(409, {error:'conflict',reason:'Document update conflict.'});
    }
    next();
  };
  server.put('/:db/:doc', put_doc);
  server.post('/:db/', put_doc);


  /**
   * DELETE method to delete documents
   */
  server.del('/:db/:doc', function(req, res, next) {
    var db = self.databases[req.params.db];
    var rev = req.query.rev || ( req.headers['if-match'] && req.headers['if-match'].replace(/"/g, '') ) || false;
    var doc = db[req.params.doc] || false;

    if(!rev || !doc || rev !== doc._rev) {
      res.send(409, {error:'conflict',reason:'Document update conflict.'});
      return false;
    }

    delete db[req.params.doc];
    res.send(200, {ok: true, id: req.params.doc, rev: ''});
  });


  /**
   * Used to add a database to the mock couch
   * @param {string} name - the name of the database
   * @param {array} arr - array with the rows
   */
  this.addDB = function(name, arr) {
    if(!arr.map) {
      return false;
    } 
    var obj = arr.reduce(function(obj, doc) {
      var id = doc._id || createMD5();
      delete doc._id;
      doc._rev = doc._rev || '1-' + createMD5(JSON.stringify(doc));
      obj[id] = doc;
      return obj;
    }, {});
    this.databases[name] = obj;
  };
  this.listen = function() {
    return server.listen.apply(server, arguments);
  };
  this.close = function() {
    return server.close.apply(server, arguments);
  };
}

module.exports = {
  createServer : function() {
    /** Returns a brand new mock couch! */
    return new mockCouch();
  }
};
