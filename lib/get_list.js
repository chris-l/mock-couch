/*jslint node: true, indent: 2, nomen: true */
'use strict';
var R = require('ramda'),
  get_view = require('./get_view');

module.exports = function (self) {

  /**
   * GET method used to show a show
   */
  return function (req, res, next) {
    var db, doc, fn_result, head, list_fn, rowIndex, output, view_fn;

    output = '';
    rowIndex = 0;
    db = self.databases[req.params.db];
    if (!db) {
      return res.send(404, {error: 'not_found', reason: 'no_db_file'});
    }
    doc = req.params.hasOwnProperty('doc') ? db['_design/' + req.params.doc] : null;
    if (!doc) {
      return res.send(404, {error: 'not_found', reason: 'missing'});
    }
    list_fn = doc.lists[req.params.listname];
    if (!list_fn) {
      return res.send(404, {
        error: 'not_found',
        reason: 'missing lists function data1 on design doc _design/complete'
      });
    }
    view_fn = doc.views[req.params.name];
    if (!view_fn) {
      return res.send(404, {error: 'not_found', reason: 'missing_named_view'});
    }

    function handleViewResponse(status, result) {
      res.setHeader('Content-Type', 'application/json');
      if (status !== 200) {
        return res.send(status, result);
      }

      head = {total_rows: result.total_rows, offset: result.offset};

      global.getRow = function () {
        /*jslint plusplus: true */
        var row = result.rows[rowIndex++];
        /*jslint plusplus: false */
        return row ? row.value : null;
      };

      global.start = function (obj) {
        var key;
        if (typeof obj === 'object') {
          if (typeof obj.headers === 'object') {
            for (key in obj.headers) {
              if (obj.headers.hasOwnProperty(key)) {
                res.setHeader(key, obj.headers[key]);
              }
            }
          }
        }
      };

      global.send = function (string) {
        output += string.toString();
      };

      global.toJSON = JSON.stringify;

      fn_result = list_fn(head, req);

      if (fn_result) {
        output += fn_result;
      }

      res.send(200, output);

      return self.emit('GET', {
        type: 'show',
        name: '_design/' + req.params.designdoc,
        show: req.params.name,
        database: req.params.db,
        output: output
      });
    }

    get_view(self)(req, {send: handleViewResponse}, next);
  };
};
