/* global __dirname */
var express = require("express");
var url = require("url");
var http = require("http");
var mysql = require("mysql");

// First you need to create a connection to the db
var con = mysql.createConnection({
  host: "localhost",
  user: "pracuser",
  password: "webtech",
  database: "todo"
});

// Connect to the db
con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

var port = 3000;
var app = express();
app.use(express.static(__dirname + "/client"));
http.createServer(app).listen(port);

var todos = [];
var t1 = {"todo-id" : "0", title: "HelloWorld", desc: "", deadline : "12/12/2015", completed: "false", completion_date: "undefined"};
todos.push(t1);

//clients requests todos
app.get("/gettodos", function (req, res) {
  res.json(todos);
});

// Show todo page
app.get("/todo", function (req, res) {
	console.log("Todo page requested");
  res.sendFile(__dirname+"/client/todo.html");
});

// Show entry page
app.get("/", function (req, res) {
  console.log("Front page requested!");
  res.sendFile("/index.html")
})

//add todo to the server
app.get("/addtodo", function (req, res) {
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["todo-id"]!==undefined) {
    var new_todo = {
      "todo-id": query["todo-id"],
      "title": query["title"],
      "desc": query["desc"],
      "deadline": query["deadline"],
      "completed": query["completed"],
      "completion_date": query["completion_date"]
    }
    todos.push(new_todo);
    res.end("Succes");
  }
  else {
    res.end("Failure");
  }

  console.log(todos);
});

// Update an existing object in the databse
app.get("/updatetodo", function(req, res) {
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["todo-id"]!==undefined) {
    var lookup = {};
    for (var i = 0, len = todos.length; i < len; i++) {
      if (todos[i]['todo-id'] == query['todo-id'])
        lookup = todos[i];
    }
    if (lookup.length !== 0) {
      for (var property in query) {
        if (query.hasOwnProperty(property)) {
          console.log("Updated property: " + property);
          lookup[property] = query[property];
        }
      }
    }
    else {
      res.end("Object not in database");
    }
    res.end("Succes");
  }
  else {
    res.end("Failure");
  }
  console.log(todos);
});

// Delete a todo
app.get("/deletetodo", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["todo-id"]!==undefined) {
    for (var i = 0; i < todos.length; i++) {
      if (todos[i]['todo-id'] === query['todo-id']) {
        todos.splice(i, 1);
        i--;
      }
    }
    res.end("Succes");
  }
  else {
    res.end("Failure");
  }
  console.log(todos);
});
