// Add a new (empty) todo to the server list
function addTodo(el) {
  $.get("/addtodo", {"todo-id": el.attr("todo-id")});
}

// Update the data in the todo on the server
function updateTodo(el, data) {
  data["todo-id"] = el.attr("todo-id");
  $.get("/updatetodo", data);//{"todo-id": el.attr("todo-id"), title: el.children("h2").first().text()});
}

// Delete a todo item
function deleteTodo(el) {
  $.get("/deletetodo", {"todo-id": el.attr("todo-id")});
  el.remove();
}

// Show settings for the Todo
function showSettings(el) {
  el.children('.todo-description').first().toggleClass('hidden');
  el.children('.todo-settings').first().toggleClass('hidden');
}

// Main function executed on page reload
function main() {
  var data_id = 0;

  // function to create a new todo
  function createTodo(existing) {
    var id = data_id;
    var title = "New Todo";
    var desc = "";
    var date = undefined;
    var completed = "false";

    // to create Todo from existing todo
    if (typeof existing !== undefined && existing['todo-id'] !== undefined) {
      id = existing['todo-id'];
      title = existing['title'];
      desc = existing['desc'];
      date = new Date(existing["deadline"]).toISOString().substr(0,10);
      completed = existing["completed"];
    }

    var emptyTodo = $('<section>', {class: 'group', "todo-id": id});
    var b_delete = $('<button>', {class: 'delete-button'});
    var b_settings = $('<button>', {class: 'settings-button'});
    var b_completed = $('<button>', {class: 'completed-button'});
    var content = $('<div>', {class: 'todo-description'});
    var header = $('<h2>', {contenteditable: 'true'}).text(title);
    var desc = $('<div>', {contenteditable: 'true'}).text(desc);
    var settings = $('<div>', {class: 'todo-settings hidden'});
    var date_picker = $('<form>Deadline: <input type="date" name="deadline"></form>');
    var tagger = $('<form>Add tag: <input type="text" placeholder="new tag" name="tag"></form>');
    date_picker.children("input").first().val(date);
    if (completed == "true") {
      emptyTodo.addClass("completed");
    }
    header.on('keypress', function(e){
      if (e.which == 13) {
        e.preventDefault();
        $(this).blur();
        updateTodo($(this).parent().parent(), {title: $(this).text()});
      }
    });
    desc.on('blur', function(e) {
      updateTodo($(this).parent().parent(), {desc: $(this).text()});
    });
    settings.on('keypress', function(e) {
      return e.which !== 13;
    });
    date_picker.children("input").first().change(function(e) {
      updateTodo($(this).parents("section").first(), {deadline: $(this).val()});
    });
    tagger.children("input").first().on('keypress', function(e) {
      if (e.which == 13) {
        updateTodo($(this).parents("section").first(), {tag: $(this).val()});
        $(this).val('');
      }
    });
    b_delete.on('click', function() {
      deleteTodo($(this).parent());
    });
    b_settings.on('click', function() {
      showSettings($(this).parent());
    });
    b_completed.on('click', function() {
      $(this).parent().toggleClass("completed");
      updateTodo($(this).parent(), {completed: true, completion_date: new Date().toLocaleString()});
    });
    emptyTodo.append(b_delete);
    emptyTodo.append(b_completed);
    emptyTodo.append(b_settings);
    settings.append(date_picker);
    settings.append(tagger);
    content.append(header);
    content.append(desc);
    emptyTodo.append(content);
    emptyTodo.append(settings);

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
          todo.children(".todo-description div").first().html(todo_item["desc"]);
          todo.find("input[name='deadline']").val(new Date(todo_item["deadline"]).toISOString().substr(0,10));;
          if (todo_item['completed'] === 'true') {
            todo.addClass("completed");
          }
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
  setInterval(function () {
    updateAllTodos();
  }, 2000);
}

$(document).ready(main);
