var router = require("express").Router();

// Show entry page
router.get("/", function (req, res) {
  console.log("Profile page requested!");
  if (req.cookies.color)
    console.log("Cookies ", req.cookies);
  else
    res.cookie('color', '#0f0f38');
  res.render("profile", {user: req.user});
});

module.exports = router;
