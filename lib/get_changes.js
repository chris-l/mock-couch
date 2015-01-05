/* jslint node: true */
'use strict';
//var stream = require('stream');

module.exports = function(self) {
  /**
   * GET method used to show the info of one database
   */
  return function(req, res, next) {
    var db = self.databases[req.params.db];

    // return the readable changes stream
    if(db && self.changes[db]) {
      console.info('returning changes');
      /*
      var str = new stream.Readable();//{
//        objectMode : true
//      });
      str.push(JSON.stringify({
        test : 'test'
      }));
      str.push(JSON.stringify({
        test : 'test2'
      }));
      str.push(null);
//      console.log(self.changes[db]);
      return str.pipe(res);
  */
      this.changes[db].push(null);
      return this.changes[db];
    }
    else{
      res.send(404, {error:'not_found',reason:'no_db_file'});
    }
  };
};
