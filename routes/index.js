var passport = require("passport");
var router = require("express").Router();
var db = require('../db');

// Show entry page
router.get(/^\/($|home)/, function (req, res) {
  console.log("Front page requested!");
  res.render("index");
});

// route for twitter authentication and login
router.get('/auth/twitter', passport.authenticate('twitter'));

// handle the callback after twitter has authenticated the user
router.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
      successRedirect : '/todo',
      failureRedirect : '/'
  })
);

module.exports = router;
