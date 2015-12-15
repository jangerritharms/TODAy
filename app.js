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

//clients requests todos
app.get("/gettodos", function (req, res) {
  con.query('SELECT * FROM ToDoItem Where Priority = 1',function(err,rows){
    if(err) throw err;

    res.json(rows);
  });
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
    con.query('INSERT INTO ToDoItem SET ?', new_todo, function(err,result){
      if(err) throw err;

      res.end(result.insertId.toString());
    });
  }
  else {
    res.end("Failure");
  }
});

// Update an existing object in the databse
app.get("/updatetodo", function(req, res) {
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["Id"]!==undefined) {
    for (var property in query) {
      // because of http query string null or undefined are converted to empty string/no passed at all
      if (query[property] == '')
        query[property] = undefined;
      
      con.query(
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
app.get("/deletetodo", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["Id"]!==undefined) {
    con.query(
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
