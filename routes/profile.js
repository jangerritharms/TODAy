var router = require("express").Router();

// Show entry page
router.get("/", function (req, res) {
  console.log("Profile page requested!");
  console.log(req.user);
  res.render("profile", {user: req.user});
});

module.exports = router;
