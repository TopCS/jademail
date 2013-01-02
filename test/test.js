var mailer = require('../')('./examples/example_mails');
var assert = require('assert');

describe('Jademail - Instantiation', function () {
  it('should throw an error when a folder is not specified', function () {
    assert.throws(
      function () {
        var jademail = require('../lib/jademail')();
      },
      /path not specified/
    );
  });
});

// describe('what?', function () {
//   it('should do what?', function (done) {
//     // test!
//   });
// });