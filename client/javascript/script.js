// Add a new (empty) todo to the server list
function addTodo(el) {
  $.get("/addtodo", {"todo-id": el.attr("todo-id")});
}

// Update the data in the todo on the server
function updateTodo(el) {
  $.get("/updatetodo", {"todo-id": el.attr("todo-id"), title: el.children("h2").first().text()});
}

// Delete a todo item
function deleteTodo(el) {
  $.get("/deletetodo", {"todo-id": el.attr("todo-id")});
  el.remove();
}

// Main function executed on page reload
function main() {
  var data_id = 0;

  // function to create a new todo
  function createTodo(existing) {
    var id = data_id;
    var title = "New Todo";

    // to create Todo from existing todo
    if (typeof existing !== undefined && existing['todo-id'] !== undefined) {
      alert("hello World");
      id = existing['todo-id'];
      title = existing['title'];
    }

    var emptyTodo = $('<section>', {class: 'group', "todo-id": id});
    emptyTodo.append($('<button>', {class: 'delete-button'}));
    emptyTodo.append($('<h2>', {contenteditable: 'true'}).text(title));
    emptyTodo.append($('<div>', {contenteditable: 'true'}));
    emptyTodo.on('keypress', function(e){
      if (e.which == 13) {
        e.preventDefault();
        $(this).blur().next().focus();
        updateTodo($(this));
      }
    });
    emptyTodo.children(".delete-button").first().on('click', function() {
      deleteTodo($(this).parent());
    });
    // to create Todo from existing todo
    if (typeof existing == undefined || existing['todo-id'] == undefined) {
      addTodo(emptyTodo);
    }
    $("main").append(emptyTodo);

    // Increase data_id for the next todo_item
    data_id++;
  }

  // Get todos from database on server
  function updateAllTodos() {
    $.get("/gettodos", function (data) {
      $.each(data, function (_, todo_item) {
        var todo = $(".group[todo-id="+todo_item["todo-id"]+"]");
        if (todo.length > 0) {
          todo.children("h2").first().html(todo_item["title"]);
        }
        else {
          createTodo(todo_item);
        }
        if (todo_item['todo-id'] > data_id)
          data_id = todo_item['todo-id'] + 1;
      });
    });
  }

  $("#main-add").on("click", createTodo);
  updateAllTodos();
}

$(document).ready(main);
