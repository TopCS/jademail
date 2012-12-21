###Jademail
###========

Simple jade email sender, with caching.

##How to include
>Jademail requires an argument when require()d, this path is the email profiles folder
```javascript
var jademail = require('jademail')('./folder/emails');
```
>It automatically loads (and cache) all the profiles found in the subdirs, when done it calls the event 'profilesLoaded'
```javascript
jademail.on('profilesLoaded', function (path) {
  console.log('Profile Path: %s loaded', path);
});
```

###Usage Example
See [examples](./jademail/tree/master/examples)

###Methods
>TODO!

###Events
>LAZY!