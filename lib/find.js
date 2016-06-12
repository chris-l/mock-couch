/*jslint node: true, indent: 2 */
'use strict';

var R = require('ramda');

module.exports = function (self) {
  /**
   * POST _find
   *
   * Basic implementation of the _find endpoint. Some differences:
   * - Does not require indexes
   * - Only supports the "selector" query parameter
   * - Does not support operators such as $eq, $gt etc.
   * - The "bookmark" functionality has not been implemented
   *
   * Ie. only direct, strict matching of selector properties against
   * document properties is currently supported.
   */
  return function (req, res, next) {
    var selector, original, docs, db;

    // Request validation
    if (!req.body || !req.body.hasOwnProperty('selector')) {
      res.send(400, {error: "missing_required_key", reason: "Missing required key: selector"});
      return next();
    }
    if (typeof req.body.selector !== 'object') {
      res.send(400, {error: "invalid_selector_json", reason: "Selector must be a JSON object"});
      return next();
    }
    selector = req.body.selector;

    original = self.databases[req.params.db];
    db = R.cloneDeep(original);

    // Create and format the docs
    docs = R.compose(
      R.map(function (data) {
        var id, doc;

        id = data[0];
        doc = R.cloneDeep(data[1]);
        doc._id = id;

        return doc;
      }),
      R.toPairs
    )(db);

    // Iteratively reduce array of docs by successively applying the selectors
    R.forEach(
      function (key) {
        docs = R.filter(
          function (doc) {
            return doc.hasOwnProperty(key) && doc[key] === selector[key];
          },
          docs
        );
      },
      Object.keys(selector)
    );

    res.send(200, {
      docs: docs,
      bookmark: "(Not implemented)"
    });
    self.emit(req.route.method, {type: '_find', database: req.params.db, rows: docs});
    next();
  };
};
