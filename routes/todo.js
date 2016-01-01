var passport = require("passport");
var url = require("url");
var router = require("express").Router();
var db = require('../db');

// Show todo page
router.get("/", isLoggedIn,  function (req, res) {
  console.log(req.user);
	console.log("Todo page requested");
  db.get().query('SELECT * FROM ToDoItem',function(err,rows){
    if(err) throw err;

    res.render("todo", {
      todos: rows,
      user: req.user
    });
  });

});

//clients requests todos
router.get("/gettodos", function (req, res) {
  db.get().query('SELECT * FROM ToDoItem',function(err,rows){
    if(err) throw err;

    res.json(rows);
  });
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


//add todo to the server
router.get("/addtodo", function (req, res) {
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  console.log(query);

  if (query["Priority"]!==undefined) {
    var new_todo = {Id: query['Id'],
                    Title: query['Title'],
                    Text: query['Text'],
                    CreationDate: query['CreationDate'],
                    DueDate: query['DueDate'],
                    Completed: query['Completed'],
                    CompletionDate: query['CompletionDate'],
                    Priority: query['Priority'],
                    ToDoListID: query['ToDoListID'],
                    ParentToDo: query['ParentToDo']
    };
    db.get().query('INSERT INTO ToDoItem SET ?', new_todo, function(err,result){
      if(err) throw err;

      res.end(result.insertId.toString());
    });
  }
  else {
    res.end("Failure");
  }
});

// Update an existing object in the databse
router.get("/updatetodo", function(req, res) {
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["Id"]!==undefined) {
    for (var property in query) {
      // because of http query string null or undefined are converted to empty string/no passed at all
      if (query[property] == '')
        query[property] = undefined;

      db.get().query(
        'UPDATE ToDoItem SET '+property+' = ? Where Id = ?',
        [query[property], query['Id']],
        function (err, result) {
          if (err) throw err;
          console.log('Changed ' + result.changedRows + ' rows');
        }
      );
    }
    res.end("Succes");
  }
  else {
    res.end("Failure");
  }
});

// Delete a todo
router.get("/deletetodo", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["Id"]!==undefined) {
    db.get().query(
      'DELETE FROM ToDoItem WHERE Id = ?',
      [query["Id"]],
      function (err, result) {
        if (err) throw err;

        console.log('Deleted ' + result.affectedRows + ' rows');
      }
    );
  }
  else {
    res.end("Failure");
  }
});

module.exports = router;
