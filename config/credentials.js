module.exports = {
  cookieSecret: 'twitterLogin',
  secret: 'twitterLogin',
  cookie: {maxAge: 6000},
  twitter: {
    consumerKey: "6ygYvFPQw8PyeCGQZDtKe8ifO",
    consumerSecret: "D6QVgJBEECreBBEJTLOFeDs7pdt3cfEl0kbqrsL8hAEhC4huCp",
    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
  }
};
