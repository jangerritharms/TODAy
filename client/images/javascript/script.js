var item_list = new Array();
function sort_by_date(a, b){
  return new Date(b.dueDate) - new Date(a.dueDate);
};

function sort_by_importance(a, b){
  return b.importance - a.importance;
}

function Item(id) {
  this.title = "New Item";
  this.done = false;
  this.id = id;
  this.edit = function(){$(this).prev("h2").attr('contentEditable',true);$(this).prev("h2").get(0).focus();};
  this.delete = function(){$(this).parent().remove();item_list.splice(this.id, 1)};
  this.toHtml = function(){return "<div class='todo-item dashboard-item' id='todoitem"+this.id+"'><input type='checkbox'><h2 style='display: inline'>New item</h2></div>";};
}

function TodoItem(id) {
  this.id = id;
  this.dueDate = "00-00-0000";
  this.importance = 0;
}



TodoItem.prototype = new Item();
TodoItem.prototype.constructor = TodoItem;
TodoItem.prototype.setDeadline = function(dueDate) {this.dueDate = dueDate;};
TodoItem.prototype.setImportance = function(importance) {this.importance = importance;};

var main = function() {
  $(".add-todo-item").on("click", function () {
    $note = new TodoItem(item_list.length);
    importance_options = [1, 2, 3, 4, 5];
    item_list.push($note);
    $newitem = $($note.toHtml());
    $newitem.append("<button class='item-edit'>Edit</button>");
    $newitem.append("<button class='item-delete'>Delete</button>");
    $newitem.append("<input class='item-date' type='date' name='dueDate'>");
    $newitem.append("<button class='item-move-up'>Move Up</button>");
    $newitem.append("<button class='item-move-down'>Move Down</button>");
    $newitem.append("<select class='item-importance'></select>");
    $newitem.insertBefore("#main-add");
    $(".item-edit").on("click", $note.edit);
    $(".item-delete").on("click", $note.delete);
    $(".item-date").change(function(){
      $note.setDeadline(this.value);
    });
    $(".item-move-up").on("click", function(){
      $(this).parent().after($(this).parent().prev());
    });
    $(".item-move-down").on("click", function(){
      $(this).parent().before($(this).parent().next());
    });
    $.each(importance_options, function(i, p){
      $("#todoitem" + $note.id + " .item-importance").append($("<option></option>").val(p).html(p));
    });
    $(".item-importance").change(function(){
      $note.setImportance(parseInt(this.value));
    });
  });

  $("#sort_by_date").on("click", function() {
    item_list.sort(sort_by_date);
    $.each(item_list, function(index, obj){
      $("#todoitem"+obj.id).prependTo("main");
    });
  });

  $("#sort_by_importance").on("click", function() {
    item_list.sort(sort_by_importance);
    $.each(item_list, function(index, obj){
      $("#todoitem"+obj.id).prependTo("main");
    });
  });

};

$(document).ready(main);
