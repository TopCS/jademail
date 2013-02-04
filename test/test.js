// Node Internals
var assert = require('assert')
  , fs = require('fs')
  , util = require('util')
// Libs
  , nodemailer = require('nodemailer')
// Global vars
  , dummyTransport = {
    host: 'mail.beonebee.it', // hostname
    secureConnection: false, // DONT use SSL
    port: 25, // port for IN-secure SMTP
    auth: {
        user: 'test@beonebee.it',
        pass: 'b1b7792gh'
    }
}
  , dummyHeaders = {
    to: 'your_email@here.com',
    from: 'test@jademail.com',
    subject: 'NPM Test @ Jademail'
}
// Local variables for recoverpwd profile
  , dummyJadeLocals = {
    name: 'Localsir',
    link: 'http://sir.dot.com'
}
  , Jademail
  , log = function(arg){console.log(util.inspect(arg, false, 3, true))};

describe('Basic:', function () {
  it('should throw an error when a folder is not specified', function () {
    assert.throws(
      function () {
        var Jademail = require('../lib/jademail')();
      },
      /path not specified/
    );
  });

  it('should load folder /examples/example_mails', function (done) {
    Jademail = require('../')('./examples/example_mails');
    Jademail.once('profilesLoaded', function (path) {
      assert.equal(path, fs.realpathSync('./examples/example_mails'), 'wrong path loaded || something went wrong');
      return done();
    });
  });

  it('should set a transport object', function (done) {
    Jademail.setTransport(dummyTransport);
    var transportobj = nodemailer.createTransport('SMTP', dummyTransport);
    assert.notDeepEqual(Jademail.transport, transportobj, 'Jademail transport is incorrect');
    return done();
  });

  it('should reload a specific profile, \'validation\' ', function (done) {
    Jademail.profileCache['validation'].expiryDate = Date.now() - 100;
    Jademail.Send('validation', dummyHeaders);
    Jademail.once('profileAdded', function (profileName) {
      assert.equal(profileName, 'validation', 're-loaded wrong profile');
    });
    Jademail.once('emailSent', function (nodemailObj, profile) {
      assert.equal(nodemailObj.to, dummyHeaders.to, 'Somewhat the dummy recipient changed');
      return done();
    });
  });
});

describe('Method Calls:', function () {
  it('listProfiles', function (done) {
    var listobj = Jademail.listProfiles(false);
    if (listobj.validation) {
      return done();
    } else {
      return done(new Error('profile list is not the expected'));
    }
    // test!
  });
  it('reloadProfiles', function (done) {
    Jademail.reloadProfiles(done);
  });
});

describe('Compilation Tests:', function() {
  it('should compile correctly a text template', function (done) {
    Jademail.Send('recoverpwd', dummyHeaders, dummyJadeLocals);
    Jademail.once('emailSent', function (nodemailObj, profile) {
      assert.equal(nodemailObj.to, dummyHeaders.to, 'Somewhat the dummy recipient changed');
      // If the template compiled correctly, should be easy to find the variable inside it! ;-)
      if ( !nodemailObj.text.match(RegExp(dummyJadeLocals.name)) )
        return done(new Error('Text didn\'t compile correctly, name missing', nodemailObj.text));
      if ( !nodemailObj.text.match(RegExp(dummyJadeLocals.link)) )
        return done(new Error('Text didn\'t compile correctly, link missing', nodemailObj.text));
      return done();
    });
  });
});