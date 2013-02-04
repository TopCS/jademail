/**
 * [jademail must be require()d with the email path as argument]
 * @param  {string} path   [required]
 * @return {Jademail}      [singleton]
 */
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
    , Jademail = function (path) {
      // Constructor body
      var self = this;
      if ( ! ( self instanceof Jademail ) ) {
        return new Jademail( path );
      }
      self.constructor.super_.call( self );
      self.profileCache = {};
      self.path = null;
      self._loadAllProfiles(path);
    }
  , jmproto = null
  , instance = null;
  util.inherits( Jademail, emitter );
  jmproto = Jademail.prototype;


  /**
   * [load a single profile from the templateFolder]
   * @param  {string}   profileName  [required]
   * @param  {function} callback    [required]
   */
  // TODO: Make this real private via *closure?*
  jmproto._loadSingleProfile = function (profileName, callback) {
    var self = this;
    // .path must be set!
    var dest_path = self.path+'/'+profileName
      , read_template = ( function (file, callback) {
        // determine which kind of file is it by extension
        var extension = file.match(/\.(\w*)/)[1];
        // prepare cache to host both paths and files
        self.profileCache[profileName].paths[extension] = self.profileCache[profileName].paths[extension] || null;
        /**
         * WARNING: developing fubar
         * - files object contains one file with an extension type <- USED TO COMPILE ITEMS
         * - paths object contains an array of file sharing same extension
         * EDIT @ 4 feb, as consistency suggests, paths now only contains ONE path to file, the one loaded into .files
         * NOTE TO SELF: .files could be actually renamed to .file!
         */
        fs.readFile(dest_path+'/'+file, 'utf8', function (err, data) {
          if (err) { return callback(err); }
          self.profileCache[profileName].files[extension] = data;
          self.profileCache[profileName].paths[extension] = file;
          // callback(null) needs to be like that in order to make async work correctly
          return callback(null);
        });
        // inside readfile, call the callback!!!
        // return callback(null);
      }).bind(self);

    // preparing object in cache
    self.profileCache[profileName] = {
      expiryDate: Date.now() + (1000 * 3600 * 8),
      files: {},
      paths: {}
    };

    fs.readdir(dest_path, function (err, filesarray) {
      if (err) { return callback(err); }
      async.forEach(filesarray, read_template, function (err) {
        if (err) { return callback(err); }
        // dummy signal, need to be used later on
        self.emit('profileAdded', profileName);
        // callback to async to work correctly
        callback(null);
      });
    });
  };
  /**
   * [loads the entire collection of profiles found in the <path>]
   * @param  {string} path         [required]
   * @param  {function} callback   [optional]
   */
  // TODO: Make this real private via *closure?*
  jmproto._loadAllProfiles = function (path, callback) {
    if (!path) { throw new Error('path not specified calling loadAllProfiles'); }
    var self = this
      , loadSingleProfile = self._loadSingleProfile.bind(self);
    callback = callback || function (err) { if (err) throw err; };

    // using realpath instead of exists() to actually do both things!
    fs.realpath(path, function (err, resolvedPath) {
      if (err) { return callback(err); }
      self.path = resolvedPath;
      fs.readdir(path, function (err, filesarray) {
        if (err) { return callback(err); }
        async.forEach(filesarray, loadSingleProfile, function (err) {
          if (err) { return callback(err); }
          // Sending signal to the space
          self.emit('profilesLoaded', resolvedPath);
          return callback(null);
        });
      });
    });
  };
  /**
   * [actually sends the mail specified by profileName]
   * @param {string}   profileName  [required]
   * @param {object}   emailHeaders [required]
   * @param {object}   jadeLocals   [optional]
   * @param {Function} callback     [optional]
   */
  jmproto.Send = function (profileName, emailHeaders, jadeLocals, callback) {
    var self = this;
    callback = callback || function(){};
    if (!self.transport) {
      return callback(new Error('transport not supplied before sending email')); }
    if (!profileName || !self.profileCache[profileName]) {
      return callback(new Error('profile '+profileName+' not found when calling Send()')); }
    if (!emailHeaders) {
      return callback(new Error('email headers not supplied when calling Send()')); }
    // function that actually sends the email
    var _sendMail = function (profileName, emailHeaders, jadeLocals, callback) {
      var profileUsed = self.profileCache[profileName]
        , compiledHtmlEmail = (profileUsed.files['jade']) ? jade.compile(profileUsed.files['jade'])(jadeLocals) : undefined
        , compiledTextEmail = (profileUsed.files['txt']) ? jade.compile(profileUsed.files['txt'])(jadeLocals) : undefined
        , emailMessage = {
        from: emailHeaders.from,
        to: emailHeaders.to,
        subject: emailHeaders.subject,
        text: compiledTextEmail,
        html: (profileUsed.files['css']) ? juice(compiledHtmlEmail, profileUsed.files['css']) : compiledHtmlEmail
      };

      // variables ready for launch, sending mail
      self.transport.sendMail(emailMessage, function(err) {
          if (err) { return callback(err); }
          // for now emits a signal with a list of recipients as argument,
          // it *may* change argument if a more appropriate appear
          self.emit('emailSent', emailMessage, profileName, Date.now());
          return callback(null);
      });
    };
    // if a profile is expired, reload it!
    if (self.profileCache[profileName].expiryDate < Date.now()) {
      self._loadSingleProfile(profileName, function (err) {
        if (err) { return callback(err); }
        return _sendMail(profileName, emailHeaders, jadeLocals, callback);
      });
    } else {
      return _sendMail(profileName, emailHeaders, jadeLocals, callback);
    }
  };
  /**
   * [returns an Object containing email profiles, if verbose is true,
   *   returns additional informations regarding profiles]
   * @param  {boolean} verbose [optional]
   * @return {object}
   */
  jmproto.listProfiles = function (verbose) {
    var self = this;
    var singleProfile = null
      , smallerObj = {};
    if (verbose) {
      return self.profileCache;
    } else {
      for (singleProfile in self.profileCache) {
        smallerObj[singleProfile] = {
          expiryDate: self.profileCache[singleProfile].expiryDate,
          paths: self.profileCache[singleProfile].paths
        };
      }
      return smallerObj;
    }
  };
  /**
   * [re-reads stored path, or flushes cache and reads the newpath if provided]
   * @param  {string} newpath   [optional, new path]
   * @param {function} callback [required]
   */
  jmproto.reloadProfiles = function (newpath, callback) {
    var self = this;
    // arguments fix
    if (typeof(newpath) == 'function') {
      callback = newpath; newpath = null; }
    // THIS IS A TIME-SPACE PARADOX! (it should never happen)
    if (!self.path) {
      return callback(new Error('reloadProfiles() called before instantiation')) }
    if (newpath) {
      self.profileCache = {};
      self._loadAllProfiles(newpath, callback);
    } else {
      self.profileCache = {};
      self._loadAllProfiles(self.path, callback);
    }
  };
  /**
   * [setups nodemailer transport object, it's always an SMTP transport type]
   * @param {object} transportObj [required]
   */
  jmproto.setTransport = function (transportObj) {
    var self = this;
    self.transport = nodemailer.createTransport('SMTP', transportObj);
  };

  // Singleton instance return
  if (!instance) {
    instance = Jademail(path);
    return instance;
  } else {
    return instance;
  }
};