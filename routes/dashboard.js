var passport = require("passport");
var url = require("url");
var router = require("express").Router();
var db = require('../db');


router.get("/", function(req, res) {
  console.log("Dashboard page requested!");
  res.render("dashboard");
});

// Query1
// Show all Lists of a User
router.get("/todoListsOfUser", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["UserId"]!==undefined) {
    db.get().query(
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
router.get("/todosOfList", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]!==undefined) {
    db.get().query(
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
router.get("/todosRange", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["Start"]!==undefined && query["Amount"]!==undefined) {
    db.get().query(
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
router.get("/todosRangeDate", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]!==undefined && query["Start"]!==undefined && query["Amount"]!==undefined && query["BeginDate"] && query["EndDate"]) {
    db.get().query(
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
router.get("/todosRangePriority", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]!==undefined && query["Start"]!==undefined && query["Amount"]!==undefined && query["Priority"]) {
    db.get().query(
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
router.get("/todosRangePriority", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]!==undefined && query["Start"]!==undefined && query["Amount"]!==undefined && query["Completed"]) {
    db.get().query(
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
router.get("/todosChildren", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["TodoId"]) {
    db.get().query(
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
router.get("/todosTags", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["TodoId"]) {
    db.get().query(
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
router.get("/todosByTag", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["TagId"]) {
    db.get().query(
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
router.get("/todosStatusByTag", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["TagId"]) {
    db.get().query(
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
router.get("/todosCompletedByWeek", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  db.get().query(
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
router.get("/todosCompletionTime", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
  if (query["TagId"]) {
    db.get().query(
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
router.get("/todosTagFrequency", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  db.get().query(
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
router.get("/todosAverageCompletion", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]) {
    db.get().query(
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
router.get("/todosLongCompletion", function (req, res) {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

  if (query["ListId"]) {
    db.get().query(
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

module.exports = router;
