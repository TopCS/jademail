var mailer = require('../lib/jademail')('../examples/example_mails');
var util = require('util');


/** /
var transport = {
    host: 'mail.beonebee.it', // hostname
    secureConnection: false, // DONT use SSL
    port: 25, // port for IN-secure SMTP
    auth: {
        user: 'test@beonebee.it',
        pass: 'b1b7792gh'
    }
};
var to = 'mister.gamer@gmail.com'
  , from = 'test@beonebee.it'
  , subject = 'SPAMM';

var email = {
  text: '../views/email/test_email.txt',
  jade: '../views/email/test_email.jade',
  css: '../public/css/email/style.css'
};

mailer1('spam', {transport: transport, email: email, to: to, from: from, subject: subject}, function() {
 // console.log('cachedEmails:', test.cachedEmails)
 // mailer1('spam');
 console.log('mail...sent?');
});

/**/

