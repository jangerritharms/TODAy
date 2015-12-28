// Add a new (empty) todo to the server list
function addTodo(el) {
  var new_id;
  $.get("/addtodo", {Priority: 1,
                     CreationDate: new Date().toISOString().substr(0,10)})
    .done(function (id) {
      new_id = id;
      el.attr("todo-id", id);
    });
  return new_id;
}

// Update the data in the todo on the server
function updateTodo(el, data) {
  data["Id"] = el.attr("todo-id");
  $.get("/updatetodo", data);
}

// Delete a todo item
function deleteTodo(el) {
  $.get("/deletetodo", {Id: el.attr("todo-id")});
  el.remove();
}

// Show settings for the Todo
function showSettings(el) {
  el.children('.todo-description').first().toggleClass('hidden');
  el.children('.todo-settings').first().toggleClass('hidden');
}

// Main function executed on page reload
function main() {
  // function to create a new todo
  function createTodo(existing) {
    var id = -1;
    var title = "New Todo";
    var desc = "";
    var date = undefined;
    var completed = "false";
    var pri = 1;

    // to create Todo from existing todo
    if (typeof existing !== undefined && existing['Id'] !== undefined) {
      id = existing['Id'];
      title = existing['Title'];
      desc = existing['Text'];
      date = new Date(existing["DueDate"]).toISOString().substr(0,10);
      completed = existing["Completed"];
      pri = existing["Priority"];
    }

    var emptyTodo = $('<section>', {class: 'group'});
    var b_delete = $('<button>', {class: 'delete-button'});
    var b_settings = $('<button>', {class: 'settings-button'});
    var b_completed = $('<button>', {class: 'completed-button'});
    var content = $('<div>', {class: 'todo-description'});
    var header = $('<h2>', {contenteditable: 'true', 'data-placeholder': 'Add Title'}).text(title);
    var desc = $('<div>', {contenteditable: 'true', 'data-placeholder': 'Add description'}).text(desc);
    var settings = $('<div>', {class: 'todo-settings hidden'});
    var date_picker = $('<form>Deadline: <input type="date" name="deadline"></form>');
    var tagger = $('<form>Add tag: <input type="text" placeholder="new tag" name="tag"></form>');
    var priority = $('<form>Importance<br><input type="radio" name="importance" value="1" checked>1<input type="radio" name="importance" value="2">2<input type="radio" name="importance" value="3">3</form>')
    date_picker.children("input").first().val(date);
    if (completed == 1) {
      emptyTodo.addClass("completed");
    }
    if (id !== -1) {
      emptyTodo.attr('todo-id', id);
    }
    emptyTodo.attr('data-priority', pri);
    header.on('keypress', function(e){
      if (e.which == 13) {
        e.preventDefault();
        $(this).blur();
        updateTodo($(this).parent().parent(), {Title: $(this).text()});
      }
    });
    header.on('blur', function(e) {
      updateTodo($(this).parent().parent(), {Title: $(this).text()});
    });
    desc.on('blur', function(e) {
      updateTodo($(this).parent().parent(), {Text: $(this).text()});
    });
    settings.on('keypress', function(e) {
      return e.which !== 13;
    });
    date_picker.children("input").first().change(function(e) {
      updateTodo($(this).parents("section").first(), {DueDate: $(this).val()});
    });
    priority.children("input").click(function(e) {
      updateTodo($(this).parents("section").first(), {Priority: $(this).val()});
      $(this).parents("section").attr('data-priority', $(this).val());
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
      if ($(this).parent().hasClass("completed")) {
        updateTodo($(this).parent(), {Completed: 0, CompletionDate: null});
      }
      else {
        updateTodo($(this).parent(), {Completed: 1, CompletionDate: new Date().toISOString().substr(0,10)});
      }
      $(this).parent().toggleClass("completed");

    });
    emptyTodo.append(b_delete);
    emptyTodo.append(b_completed);
    emptyTodo.append(b_settings);
    settings.append(date_picker);
    settings.append(tagger);
    settings.append(priority);
    content.append(header);
    content.append(desc);
    emptyTodo.append(content);
    emptyTodo.append(settings);

    // to create Todo from existing todo
    if (typeof existing == undefined || existing['Id'] == undefined) {
      id = addTodo(emptyTodo);
      $("main").append(emptyTodo);
      $(".group[todo-id="+id+"]").find("h2").first().focus();
    }
    else
      $("main").append(emptyTodo);

  }

  // Get todos from database on server
  function updateAllTodos() {
    $.get("/gettodos", function (data) {
      $.each(data, function (_, todo_item) {
        var todo = $(".group[todo-id="+todo_item["Id"]+"]");
        if (todo.length > 0) {
          todo.children("h2").first().html(todo_item["Title"]);
          todo.children(".todo-description div").first().html(todo_item["Text"]);
          todo.find("input[name='deadline']").val(new Date(todo_item["DueDate"]).toISOString().substr(0,10));;
          if (todo_item['Completed'] === 1) {
            todo.addClass("completed");
          }
        }
        else {
          createTodo(todo_item);
        }
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
