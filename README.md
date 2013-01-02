#Jademail
========

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

##Usage Example
See [examples](./jademail/tree/master/examples)



###Methods

```javascript
// loads the entire collection of profiles found in the <path>
Jademail.loadAllProfiles( String path, Function callback )

// sends the mail profile specified by profileName, compiling with the provided locals
// jadeLocals, callback are *optional*
Jademail.Send( String profileName, Object emailHeaders, Object jadeLocals, Function callback )

// returns an Object containing email profiles, if verbose is true,
// returns additional informations regarding profiles
Jademail.listProfiles( Boolean verbose ) : Object

// re-reads stored path, or flushes cache and reads the newpath if provided
// newpath is optional, needed only if the path is different than the former one
Jademail.reloadProfiles( String newpath, Function callback )

// setups nodemailer transport object, it's always an SMTP transport type
Jademail.setTransport( Object transportObj )
```

###Events

```javascript
// @profileAdded - Triggered when a new profile is loaded, this gets triggered
//                  multiple times during first istantiation (usually)
Jademail.on('profileAdded', function (String profileName){}) 

// @profilesLoaded - Triggered when a loadAllProfiles() gets completed
Jademail.on('profilesLoaded', function (String path){});

// @emailSent - An email is sent, recipient(s) gets returned
Jademail.on('emailSent', function (String recipients){});
```