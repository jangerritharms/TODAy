var db = require('../db');

exports.all = function(callback) {
  db.get().query('SELECT * FROM ToDoItem',callback);
}

exports.add = function(item, callback) {
  db.get().query('INSERT INTO ToDoItem SET ?', item, callback);
}

exports.update = function(item, callback) {
  for (var property in item) {
    // because of http query string null or undefined are converted to empty string/no passed at all
    if (item[property] == '')
      item[property] = undefined;

    db.get().query(
      'UPDATE ToDoItem SET '+property+' = ? Where Id = ?',
      [item[property], item['Id']],
      callback
    );
  }
}

exports.delete = function(itemID, callback) {
  db.get().query(
    'DELETE FROM ToDoItem WHERE Id = ?',
    [itemID],
    callback
  );
}
