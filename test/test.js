var mailer = require('../')('./examples/example_mails');
var util = require('util');

/** /
mailer.setTransport({
    host: 'mail.beonebee.it', // hostname
    secureConnection: false, // DONT use SSL
    port: 25, // port for IN-secure SMTP
    auth: {
        user: 'test@beonebee.it',
        pass: 'b1b7792gh'
    }
});

var emailHeaders = {
  to: 'mister.gamer@gmail.com',
  from: 'test@beonebee.it',
  subject: 'forever troll'
};


mailer.on('profilesLoaded', function (path) {
  mailer.profileCache['validation'].expiryDate = Date.now();
  setTimeout(function(){
    console.log(util.inspect(mailer.listProfiles(false), false, 3, true));
    mailer.Send('validation', emailHeaders);
  }, 10);
  // console.log(util.inspect(mailer.listProfiles(false), false, 4, true));
});

mailer.on('profileAdded', function (profileName) {
  console.log('profile \''+profileName+'\' added');
});

mailer.on('emailSent', function (to) {
  console.log('email sent to \''+to);
});

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

/** /
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
exports.transport = transport;
/**/