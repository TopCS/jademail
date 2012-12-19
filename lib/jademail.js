
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
 

module.exports = (function () {
  'use strict';
  // Node Internals
  var fs = require('fs');
  // Libs
  var async = require('async')
    , nodemailer = require('nodemailer')
    , jade = require('jade')
    , juice = require('juice');

  // Permanent Email cache
  // cachedEmails.example = {
  //   transport: nodemailer transport,
  //   files: {
  //     text: text_file,
  //     jade: jade_raw_file,
  //     css: css_file
  //   }
  // }
  var cachedEmails = {};

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

  return sendMail;
}) ();
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