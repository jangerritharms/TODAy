var TwitterStrategy  = require('passport-twitter').Strategy;

// load the auth variables
var configAuth = require('./credentials');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
  //    console.log('Serializing: ' + JSON.stringify(user));
      done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
  //    console.log('Deserializing: ' + obj);
      done(null, obj);
  });
  // =========================================================================
  // TWITTER =================================================================
  // =========================================================================
  passport.use(new TwitterStrategy({
    consumerKey: configAuth.twitter.consumerKey,
    consumerSecret: configAuth.twitter.consumerSecret,
    callbackURL: configAuth.twitter.callbackURL
    },
    function(token, tokenSecret, profile, done) {
      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Twitter
      process.nextTick(function() {
        console.log(profile.id );
        done(null, profile);
      });
    })
  );
};
