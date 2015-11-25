function addTodoListItem() {
  var div = document.createElement("div");
  var h2 = document.createElement("h2");
  h2.innerHTML = "<input type='checkbox'>New Item";
  div.appendChild(h2);
  var main = document.body.getElementsByTagName("main")[0];
  var add_button = document.getElementById("main-add");
  main.insertBefore(div, add_button);
}
