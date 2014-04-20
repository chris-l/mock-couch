<h1><img src="https://raw.github.com/chris-l/mock-couch/master/title.png" alt="The Mock Couch" width="500px" height="97px" /></h1>

[![Build Status](https://travis-ci.org/chris-l/mock-couch.png?branch=master)](https://travis-ci.org/chris-l/mock-couch)

Mock a CouchDB server for your unit tests.

<img src="http://christopher-luna.com/mock-couch.svg" height="316" alt="A photo of a Mock Couch" title="'It's the thing Mock Couch Soup is made from,' said the Queen." />

Mock Couch will create an HTTP server that emulates the responses of a real CouchDB server.
Since it is an actual HTTP server, no matter if you use libraries like cradle and nano, your code should work out of the box.

Mock Couch emit events, so you can listen to them to see the result of your test.

## Installation

```
npm install --save-dev mock-couch
```

## Features

* Implemented with [restify](https://github.com/mcavage/node-restify).
* Uses simple JavaScript objects as documents.
* It emit events, so the tests can listen to them.
* The `mock_couch` object has a `databases` public property, to examine how the databases are in any moment.
* Several of the CouchDB REST methods. Right now it has:
 - GET one document
 - GET `_all_docs`, including:
    - `include_docs=true`
    - `descending=true`
    - `startkey`
    - `endkey`
    - also, using `_all_docs` with POST to specify the desired keys
 - GET the information of a database
 - GET `_all_dbs`
 - PUT one document
 - PUT a database
 - POST one document
 - POST to `_bulk_docs` multiple documents
 - DELETE one document
 - DELETE a database

## Not yet implemented

* Views (`_design` documents) with either map/reduce functions or just objects emulating their outputs.
* deleting by setting the `_deleted` member
* `_changes`
* And a lot of other things!

Keep in mind that Mock Couch is not attempting to fully implement CouchDB, but only the features necessary for unit testing CouchDB based apps.

However, if there is a feature you need for your tests, feel free to add a feature request in the [issues section](https://github.com/chris-l/mock-couch/issues)!

## Usage

Here is an example:

```javascript
var mockCouch = require('mock-couch');

// myfun is the function that we want to test.
// It uses couchdb, either by using cradle, nano, or direct http requests
// This function takes an object as parameter, maybe runs some validations
// and if everything is ok, then save it on couchdb.
var myfun = require('somefunc');


describe('myfun', function() {

  beforeEach(function() {
    // Starting the server
    var couchdb = mockCouch.createServer();

    // Make sure you are either executing this test under a machine that does not have couchdb installed/enabled,
    // or that you are using a different port!
    // (which may require that you are able to specify the couchdb port on the function you are about to test)
    couchdb.listen(5984);

    // This creates a db for Mock Couch. The db is nothing but an array of objects.
    // If we provide an object with an _id property, it will use it. Otherwise, it will create a random one.
    couchdb.addDB('people', [ { name : 'one name', lastname : 'one lastname' }, { _id : '4568797890', name : 'second name', lastname : 'other lastname' } ]);
  });


  // Here is the test
  it('must add a person to couchdb', function(done) {

    // Now we add a listener that is expecting the data we are about to send.
    couchdb.on('POST', function(data) {
      expect(data.doc.name).toBe('reimu');
      expect(data.doc.lastname).toBe('hakurei');
      done();
    });

    // And here we are finally calling the function
    myfun({ name : 'reimu', lastname : 'hakurei' });

  });
});
```

## Status

Is still in its alpha stage, so its possible that it changes a lot.

## License

MIT license

## Contribution

Your feedback, pull requests, etc are welcomed! :)
