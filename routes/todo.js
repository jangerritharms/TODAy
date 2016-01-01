var passport = require("passport");
var url = require("url");
var router = require("express").Router();
var items = require("../models/items");
var db = require('../db');

// Show todo page
router.get("/", isLoggedIn,  function (req, res) {
  items.all(function(err,rows){
    if(err) throw err;

    res.render("todo", {
      todos: rows,
      user: req.user
    });
  });
});

//clients requests todos
router.get("/gettodos", function (req, res) {
  items.all(function(err,rows){
    if(err) throw err;

    res.json(rows);
  });
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();

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
    items.add(new_todo, function(err,result){
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
    items.update(query, function(err, result) {
      if(err) throw err;
    })
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
    items.delete(query["Id"], function(err, result){
      if(err) throw err;
    })
    res.end("Success");
  }
  else {
    res.end("Failure");
  }
});

module.exports = router;
