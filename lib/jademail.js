
 // var mailer = require('mailer');
 // emailer.sendMail('spam_mail', settings, function (err, returnvalue))
 // settings = {
 //   transport: nodemailer_transport_obj,
 //   email: {
 //     text: string,
 //     jade: string,
 //     jade_params: JSON object,
 //     css: string
 //   },
 //   to: string || string[],
 //   from: string,
 //   subject: string
 // }
 //
 

module.exports = function (path) {
  'use strict';
  // Node Internals
  var fs = require('fs')
    , util = require('util')
    , emitter = require( 'events' ).EventEmitter
    // Libs
    , async = require('async')
    , nodemailer = require('nodemailer')
    , jade = require('jade')
    , juice = require('juice')

  // Permanent Email cache
  // cachedEmails.example = {
  //   transport: nodemailer transport,
  //   files: {
  //     text: text_file,
  //     jade: jade_raw_file,
  //     css: css_file
  //   }
  // }
  // var cachedEmails = {};


    , Jademail = function (path) {
    // Constructor body
    var self = this;
    if ( ! ( self instanceof Jademail ) ) {
      return new Jademail( path );
    }
    self.constructor.super_.call( self );
    // 1- Check if path exists
    // 2- Read Path
    // 3- call _loadProfile on resulting array.
    self.profileCache = {};
    self.path = null;
    self.loadAllProfiles(path, function(){ console.log('profiles have been loaded'); console.log(util.inspect(self, false, 3, true)); });
    }
  , jmproto = null
  , instance = null;
  util.inherits( Jademail, emitter );
  jmproto = Jademail.prototype;


  /**
   * [load a single profile from the templateFolder]
   * @param  {string}   identifier  [required]
   * @param  {function} callback    [required]
   */
  jmproto._loadSingleProfile = function (identifier, callback) {
    var self = this;
    // .path must be set!
    var dest_path = self.path+'/'+identifier
      , read_template = ( function (file, callback) {
        // determine which kind of file is it by extension
        var extension = file.match(/\.(\w*)/)[1];
        // console.log(dest_path+'/'+file);
        fs.readFile(dest_path+'/'+file, 'utf8', function (err, data) {
          if (err) { throw err; return; }
          self.profileCache[identifier].files[extension] = file; //data;
          callback(null);
        });
        // inside readfile, call the callback!!!
        // return callback(null);
      }).bind(self);

    console.log('_loadProfile called for', dest_path);
    self.profileCache[identifier] = {
      exprDate: Date.now() + (1000 * 3600 * 8),
      files: {}
    };

    fs.readdir(dest_path, function (err, filesarray) {
        async.forEach(filesarray, read_template, function (err) {
          if (err) { throw err; return; };
          callback(null);
          // Maybe emit a signal?
        });
    });
  };
  /**
   * [loads the entire collection of profiles found in the <path>]
   * @param  {string} path         [required]
   * @param  {function} callback   [required]
   */
  jmproto.loadAllProfiles = function (path, callback) {
    var self = this
      , loadSingleProfile = self._loadSingleProfile.bind(self);

    // using realpath instead of exists() to actually do both things!
    fs.realpath(path, function (err, resolvedPath) {
      if (err) { throw new Error('Jademail called with a non-existing path', path, err); return; }
      self.path = resolvedPath;
      fs.readdir(path, function (err, filesarray) {
        async.forEach(filesarray, loadSingleProfile, function (err) {
          if (err) { throw err; return; };
          callback(null);
          // Maybe emit a signal?
        });
      });
    });
  };
  /**
   * [actually sends the mail specified by identifier]
   * @param {string} identifier [required]
   * @param {function} callback [required]
   */
  jmproto.Send = function (identifier, callback) {};
  /**
   * [returns an Object containing email profiles, if verbose is true,
   *   returns additional informations regarding profiles]
   * @param  {boolean} verbose [optional]
   * @return {object}
   */
  jmproto.listProfiles = function (verbose) {};
  /**
   * [re-reads stored path, or flushes cache and reads the newpath if provided]
   * @param  {string} newpath   [optional, new path]
   * @param {function} callback [required]
   */
  jmproto.reloadProfiles = function (newpath, callback) {};
  /**
   * [setups nodemailer transport object, it's always an SMTP transport type]
   * @param {object} transportObj [required]
   */
  jmproto.setTransport = function (transportObj) {};


  var sendMail = function (identifier, settings, callback) {
    // console.log('cachedEmails', cachedEmails);
    if (!settings || !settings.email || !settings.transport) {
      throw new Error('Incorrect number of parameters when calling sendMail()'); }
    // If it's cached, it still needs quite some informations
    if (cachedEmails[identifier]) {
      // Directly send cached email! :-)
      // use _send()!
      // Reminder: recompile jade template
      return;
    }
    var transport = nodemailer.createTransport('SMTP', settings.transport);
    var message = {
      from: settings.from || null,
      to: settings.to || null,
      subject: settings.subject || null
    };
    var html_template
      , storedObj = {};

    /**
     * [Internal function that actually sends the e-mail!]
     * @param  {nodemailer transport obj}   transport
     * @param  {nodemailer message}         message
     * @param  {function}   callback    [to call after email is sent]
     */
    var _send = function (transport, message, callback) {
      transport.sendMail(message, function(error){
          if (error) { return callback(error); }
          console.log('Message sent successfully!');
          return callback(null, true);
          
          // if you don't want to use this transport object anymore, uncomment following line
          // Don't close it because we can use it later, again, since it gets cached!
          // transport.close();
      });
    };

    async.parallel([
      function (callback) {
        fs.readFile(settings.email.text, 'utf8', callback);
        console.log('reading','text','- file:', settings.email.text);
      },
      function (callback) {
        fs.readFile(settings.email.jade, 'utf8', callback);
        console.log('reading','jade','- file:', settings.email.jade);
      },
      function (callback) {
        fs.readFile(settings.email.css, 'utf8', callback);
        console.log('reading','css','- file:', settings.email.css);
      }],
      function (err, results) {
        if (err) { throw err; return null; }
        // 1- FUCKIN STORE IT!
        storedObj.transport = settings.transport;
        storedObj.files = {
          text: results[0],
          jade: results[1],
          css: results[2]
        };
        cachedEmails[identifier] = storedObj;
        // 2- COMPILE JADE
        html_template = jade.compile(results[1])(settings.email.jade_params);
        // 2b- COMPILE MESSAGE
        message.text = results[0];
        message.html = juice(html_template, results[2]);
        // 2b- ??!!!!
        // 3- SEND TEH FUCKN MAILL11!11
        _send(transport, message, callback);
      }
    );



  // End of sendMail();
  };

  if (!instance) {
    instance = Jademail(path);
    return instance;
  } else {
    return instance;
  }
  // return sendMail;
};
/*
var transport = nodemailer.createTransport('SMTP', {
    host: 'mail.beonebee.it', // hostname
    secureConnection: false, // DONT use SSL
    port: 25, // port for IN-secure SMTP
    auth: {
        user: 'test@beonebee.it',
        pass: 'b1b7792gh'
    }
});

var text_email = fs.readFileSync('../views/email/test_email.txt', 'utf8');
var jadetemplate = jade.compile(fs.readFileSync('../views/email/test_email.jade', 'utf8'));
var css = fs.readFileSync('../public/css/email/style.css', 'utf8');
var formatted_html = juice(jadetemplate(), css);
// console.log(formatted_html);
console.log('HTML Compiled!');


var message = {
  from: 'BeOneBee Test Account <test@beonebee.it',
  to: 'mister.gamer@gmail.com',
  subject: 'NodeMailer is Unicorn Friendly',
  text: text_email,
  html: formatted_html,
  attachments: []
};



console.log('Sending Mail');
transport.sendMail(message, function(error){
    if(error){
        console.log('Error occured');
        console.log(error.message);
        return;
    }
    console.log('Message sent successfully!');
    
    // if you don't want to use this transport object anymore, uncomment following line
    transport.close(); // close the connection pool
});





exports.examplemsg = message;
exports.transport = transport;*/