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

// function to create a new todo
function createTodo(existing) {
  var id = -1;
  var title = "";
  var desc = "";
  var date = undefined;
  var completed = "false";
  var pri = 1;

  // to create Todo from existing todo
  if (typeof existing !== undefined && existing['Id'] !== undefined) {
    id = existing['Id'];
    title = existing['Title'];
    desc = existing['Text'];
    date = new Date(existing["DueDate"]).toISOString();
    completed = existing["Completed"];
    pri = existing["Priority"];
  }

  var emptyTodo = $('<section>', {class: 'widget widget-col-1'});
  var controlArea = $('<div>', {class: 'control-area'});
  var b_delete = $('<a>', {class: 'btn btn-control delete'});
  b_delete.append($('<span>', {class: 'control-button fa fa-close'}));
  var b_completed = $('<a>', {class: 'btn btn-control complete'});
  b_completed.append($('<span>', {class: 'control-button fa fa-check'}));
  b_delete.on('click', function() {
    deleteTodo($(this).parent().parent());
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
  controlArea.append(b_delete);
  controlArea.append(b_completed);
  var content = $('<div>', {class: 'todo-description'});
  var header = $('<h2>', {contenteditable: 'true', 'data-placeholder': 'Add Title'}).text(title);
  var desc = $('<div>', {contenteditable: 'true', 'data-placeholder': 'Add description'}).text(desc);

  if (completed == 1) {
    emptyTodo.addClass("completed");
  }
  if (id !== -1) {
    emptyTodo.attr('todo-id', id);
  }
  emptyTodo.attr('data-priority', pri);
  emptyTodo.attr('data-dueDate', date);
  header.on('keypress', function(e){
    if (e.which == 13) {
      e.preventDefault();
      $(this).blur();
      updateTodo($(this).parent().parent(), {Title: $(this).text()});
    }
  });
  header.on('blur', function(e) {
    updateTodo($(this).parent().parent(), {Title: $(this).text()});
    showGeneralSettings();
  });
  desc.on('blur', function(e) {
    updateTodo($(this).parent().parent(), {Text: $(this).text()});
    showGeneralSettings();
  });

  content.append(header);
  content.append(desc);

  emptyTodo.append(controlArea);
  emptyTodo.append(content);

  emptyTodo.on("focusin", function(e){
    e.stopPropagation();
    showWidgetSettings($(this));
  });
  emptyTodo.on("click", function(e) {
    e.stopPropagation();
  });

  // to create Todo from existing todo
  if (typeof existing == undefined || existing['Id'] == undefined) {
    id = addTodo(emptyTodo);
    $(".content").append(emptyTodo);
    $(".widget[todo-id="+id+"]").find("h2").first().focus();
  }
  else
    $(".content").append(emptyTodo);

}

// Get todos from database on server
function updateAllTodos() {
  $.get("/gettodos", function (data) {
    $.each(data, function (_, todo_item) {
      var todo = $(".widget[todo-id="+todo_item["Id"]+"]");
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

function showWidgetSettings(section) {
  $(".general").addClass("hidden");
  $(".todo-settings-main").removeClass("hidden");
  $(".todo-settings-main > form > input[name='deadline']").val(section.attr('data-duedate').substr(0,10));
  $(".todo-settings-main > form > input[value="+section.attr('data-priority')+"]").prop('checked', true);
  $(".todo-settings-main > form > input[name='deadline']").change(function(e) {
    updateTodo(section, {DueDate: $(this).val()});
  });
  $(".todo-settings-main > form > input[name='importance']").click(function(e) {
    updateTodo(section, {Priority: $(this).val()});
    section.attr('data-priority', $(this).val());
  });
  $(document).one("keydown", function(e) {
    if (e.keyCode == 27) {
      showGeneralSettings();
      $(":focus").blur();
    }
  });
}

function showGeneralSettings() {
  $(".general").removeClass("hidden");
  $(".todo-settings-main").addClass("hidden");
  $(document).unbind('keydown');
};

// Main function executed on page reload
function main() {
  $(document).on("click", function(e){
    showGeneralSettings();
  });
  $("section").on("focusin", function(e){
    e.stopPropagation();
    showWidgetSettings($(this));
  });
  $("section").on("click", function(e) {
    e.stopPropagation();
    showWidgetSettings($(this));
  });
  $("header").on("click", function(e) {
    e.stopPropagation();
  });
  $(".delete").on('click', function() {
    deleteTodo($(this).parent().parent());
  });
  $(".complete").on('click', function() {
    if ($(this).parent().hasClass("completed")) {
      updateTodo($(this).parent(), {Completed: 0, CompletionDate: null});
    }
    else {
      updateTodo($(this).parent(), {Completed: 1, CompletionDate: new Date().toISOString().substr(0,10)});
    }
    $(this).parent().toggleClass("completed");
  });
  $(".todo-description h2").on('keypress', function(e){
    if (e.which == 13) {
      e.preventDefault();
      $(this).blur();
      updateTodo($(this).parent().parent(), {Title: $(this).text()});
    }
  });
  $(".todo-description h2").on('blur', function(e) {
    updateTodo($(this).parent().parent(), {Title: $(this).text()});
    showGeneralSettings();
  });
  $(".todo-description div").on('blur', function(e) {
    updateTodo($(this).parent().parent(), {Text: $(this).text()});
    showGeneralSettings();
  });
  $("#main-add").on("click", createTodo);
  setInterval(function () {
    updateAllTodos();
  }, 10000);
}

$(document).ready(main);
