/*jslint node: true, indent: 2, nomen: true */
'use strict';
var R = require('ramda');

module.exports = function (self) {
  /**
   * GET method used to show a show
   */
  return function (req, res) {
    var db, designdoc, doc, img, key, name, output, show_fn;

    doc = null;
    db = self.databases[req.params.db];
    if (!db) {
      return res.send(404, {error: 'not_found', reason: 'no_db_file'});
    }
    designdoc = req.params.hasOwnProperty('designdoc') ? db['_design/' + req.params.designdoc] : null;
    if (!designdoc) {
      return res.send(404, {error: 'not_found', reason: 'missing'});
    }
    show_fn = designdoc.shows[req.params.name];
    if (!show_fn) {
      return res.send(404, {error: 'not_found', reason: 'missing'});
    }

    name = req.params.doc;
    if (name) {
      if (!db.hasOwnProperty(name)) {
        return res.send(404, {error: 'not_found', reason: 'missing'});
      }
      doc = R.cloneDeep(db[name]);
      doc._id = name;
    }

    try {
      output = show_fn(doc, req);
    } catch (error) {
      return res.send(500, {error: 'render_error', reason: 'function raised error: ' + error.message});
    }

    if (typeof output === 'object') {
      if (typeof output.headers === 'object') {
        for (key in output.headers) {
          if (output.headers.hasOwnProperty(key)) {
            res.setHeader(key, output.headers[key]);
          }
        }
      }
      if (output.base64) {
        img = new Buffer(output.base64, 'base64');
        return res.end(img);
      }
      return res.send(200, output.body);
    }

    res.send(200, output);

    return self.emit('GET', {
      type: 'show',
      name: '_design/' + req.params.designdoc,
      show: req.params.name,
      database: req.params.db,
      output: output
    });
  };
};
