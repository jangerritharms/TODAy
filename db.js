var mysql = require("mysql");

var state = {
  db: null
}

exports.connect = function(config, done) {
  if (state.db) done();

  state.db = mysql.createConnection(config);

  state.db.connect(done);
}

exports.get = function() {
  return state.db;
}

exports.disconnect = function(done) {
  state.db.end(done);
}
