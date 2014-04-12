<h1><img src="https://raw.github.com/chris-l/mock-couch/master/title.png" alt="The Mock Couch" width="500px" height="97px" /></h1>

[![Build Status](https://travis-ci.org/chris-l/mock-couch.png?branch=master)](https://travis-ci.org/chris-l/mock-couch)

Mock a CouchDB server for your unit tests.

Mock Couch will create an HTTP server that emulates the responses of a real CouchDB server.
Since it is an actual HTTP server, no matter if you use libraries like cradle and nano, your code should work out of the box.

Mock Couch emit events, so you can listen to them to see the result of your test.

## Installation

```
npm install --save-dev mock-couch
```

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
