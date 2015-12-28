/* global __dirname */
var express = require("express");
var url = require("url");
var http = require("http");
var mysql = require("mysql");
var passport = require("passport");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var ejs = require("ejs");

require("./config/passport")(passport);

// First you need to create a connection to the db
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "webdata",
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
app.use(cookieParser());
app.use(express.static(__dirname + "/client"));
app.use(session({secret: 'twitterLogin'}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
http.createServer(app).listen(port);

//clients requests todos
app.get("/gettodos", function (req, res) {
  con.query('SELECT * FROM ToDoItem Where Priority = 1',function(err,rows){
    if(err) throw err;

    res.json(rows);
  });
});

// Show todo page
app.get("/todo", isLoggedIn, function (req, res) {
  console.log(req.user);
	console.log("Todo page requested");
  res.sendFile(__dirname+"/client/todo.html");
});

// Show entry page
app.get("/", function (req, res) {
  console.log("Front page requested!");
  res.sendFile("/index.html");
});

// =====================================
// TWITTER ROUTES ======================
// =====================================
// route for twitter authentication and login
app.get('/auth/twitter', passport.authenticate('twitter'));

// handle the callback after twitter has authenticated the user
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
      successRedirect : '/todo',
      failureRedirect : '/'
  })
);


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


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

// Query1
// Show all Lists of a User
app.get("/todoListsOfUser", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["UserId"]!==undefined) {
    con.query(
      'SELECT * FROM ToDoList WHERE Owner = ?',
      [query["UserId"]],
      function (err, rows) {
        if (err) throw err;

        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});

// Query2
// Show all todos of a list
app.get("/todosOfList", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]!==undefined) {
    con.query(
      'select * from ToDoItem where ToDoListId = ?',
      [query["ListId"]],
      function (err, rows) {
        if (err) throw err;

        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});

// Query3
// Show all todos of a list in a range of items
app.get("/todosRange", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["Start"]!==undefined && query["Amount"]!==undefined) {
    con.query(
      'select * from ToDoItem limit ?,?',
      [query["ListId"], parseInt(query["Start"]), parseInt(query["Amount"])],
      function (err, rows) {
        if (err) throw err;

        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});

// Query4.1
// Show all todos of a range in a range of dates
app.get("/todosRangeDate", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]!==undefined && query["Start"]!==undefined && query["Amount"]!==undefined && query["BeginDate"] && query["EndDate"]) {
    con.query(
      'select * from ToDoItem where CreationDate between ? and ? limit ?,?;',
      [query["BeginDate"], query["EndDate"], parseInt(query["Start"]), parseInt(query["Amount"])],
      function (err, rows) {
        if (err) throw err;

        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});

// Query4.2
// Show all todos of a range with given priority
app.get("/todosRangePriority", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]!==undefined && query["Start"]!==undefined && query["Amount"]!==undefined && query["Priority"]) {
    con.query(
      'select * from ToDoItem where Priority = ? limit ?,?',
      [query["Priority"], parseInt(query["Start"]), parseInt(query["Amount"])],
      function (err, rows) {
        if (err) throw err;

        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});


// Query4.3
// Show all todos of a list in a range of items
app.get("/todosRangePriority", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]!==undefined && query["Start"]!==undefined && query["Amount"]!==undefined && query["Completed"]) {
    con.query(
      'select * from ToDoItem where Completed = ? limit ?,?',
      [query["Completed"], parseInt(query["Start"]), parseInt(query["Amount"])],
      function (err, rows) {
        if (err) throw err;

        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});

// Query5
// Show all children todos of given todo
app.get("/todosChildren", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["TodoId"]) {
    con.query(
      'select * from ToDoItem where ParentToDo = ?',
      [query["TodoId"]],
      function (err, rows) {
        if (err) throw err;

        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});

// Query6
// Show all children todos of given todo
app.get("/todosTags", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["TodoId"]) {
    con.query(
      'select Text from Tag,ItemTag where ItemTag.ToDoId = ? and ItemTag.TagId = Tag.Id;',
      [query["TodoId"]],
      function (err, rows) {
        if (err) throw err;

        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});

// Query7
// Show all children todos of given todo
app.get("/todosByTag", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["TagId"]) {
    con.query(
      'select * from ToDoList, ToDoItem,ItemTag  where ToDoList.Id=ToDoItem.ToDoListID and ItemTag.ToDoId=ToDoItem.Id and ItemTag.TagId=?',
      [query["TagId"]],
      function (err, rows) {
        if (err) throw err;

        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});

// Query8
// Show completed and pending tasks per tag
app.get("/todosStatusByTag", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["TagId"]) {
    con.query(
      'select Completed, count(*) from ToDoItem, ItemTag where ItemTag.ToDoId=ToDoItem.Id and ItemTag.TagId=? group by Completed',
      [query["TagId"]],
      function (err, rows) {
        if (err) throw err;

        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});

// Query9
// Show amount of tasks completed for each week of the year
app.get("/todosCompletedByWeek", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  con.query(
    'select WEEK(CreationDate) as week, count(*) as completed from ToDoItem where Completed=1 and YEAR(CreationDate) = YEAR(CURDATE()) group by WEEK(CreationDate);',
    [],
    function (err, rows) {
      if (err) throw err;
      res.json(rows);
    }
  );
});

// Query10
// Show amount of tasks completed for each week of the year
app.get("/todosCompletionTime", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
  if (query["TagId"]) {
    con.query(
      'SELECT *, TIMESTAMPDIFF(SECOND, CreationDate,CompletionDate) as time from ToDoItem, ItemTag where completed=1 and ItemTag.TagId=? and ToDoItem.Id = ItemTag.ToDoId order by TagId,time limit 10;',
      [query["TagId"]],
      function (err, rows) {
        if (err) throw err;
        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});

// Query11
// Show number of co-occurring tags
app.get("/todosTagFrequency", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  con.query(
    'select a.TagId as Tag1, b.TagId as Tag2, count(*) as amount from ToDoItem, ItemTag as a, ItemTag as b where ToDoItem.Id = a.TodoId and a.TagId > b.TagId and ToDoItem.Id = b.TodoId group by a.TagId, b.TagId;',
    [query["TagId"]],
    function (err, rows) {
      if (err) throw err;
      res.json(rows);
    }
  );
});

// Query12
// Show number of co-occurring tags
app.get("/todosAverageCompletion", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]) {
    con.query(
      'select avg(TIMESTAMPDIFF(SECOND,CreationDate,CompletionDate)) as AvgCompletionTime from ToDoItem where ToDoItem.TodoListId = ? and Completed=1;',
      [query["ListId"]],
      function (err, rows) {
        if (err) throw err;
        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});

// Query13
// Completion time larger than average
app.get("/todosLongCompletion", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]) {
    con.query(
      'select * from todoitem where completed=1 and todolistid=? and timestampdiff(second,creationdate,completiondate) > (select avg(timestampdiff(second, creationdate, completiondate)) from todoitem where todolistid=?);',
      [query["ListId"], query["ListId"]],
      function (err, rows) {
        if (err) throw err;
        res.json(rows);
      }
    );
  }
  else {
    res.end("Failure");
  }
});
