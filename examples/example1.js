var mailer = require('../')('./examples/example_mails');
var util = require('util');

/**/
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
/**/