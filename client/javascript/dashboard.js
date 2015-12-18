// update the bar chart widget
function updateBarChart(el, todos) {
  var bars = el.children('.bar');
  var max_width = el.width();
  var max = 0;
  var avg = 0;
  var times = [];
  var labels = [];
  for(var i=0;i<todos.length;i++) {
    var time = todos[i]['time'];
    if (time !== 0 && time !== undefined) {
      times.push(time);
      labels.push(todos[i]['Title']);
      if ( time > max)
        max = time;
      avg = avg * (times.length-1)/times.length + time * 1/times.length;
    }
  }
  times.push(avg);
  labels.push("Average");
  $.each(bars, function(j, bar) {
    bar.style.width = times[j]*max_width/max+"px";
    $(bar).html("<p>" + labels[j] + "</p>");
  });

}

// Ajax request for the completion times by tag
function getCompletionTime(tagid) {
  $.get("/todosCompletionTime", {TagId: tagid})
    .done(function (todos) {
      updateBarChart($('#completion-by-tag').children('.bar-chart').first(), todos);
  });
}

function getTagCoocurrence(el) {
  $.get("/todosTagFrequency")
    .done(function (tags) {
      for (var i=0; i < tags.length; i++) {
        el.append($('<p>').text("Tags: "+tags[i]["Tag1"]+", "+tags[i]["Tag2"]+" Frequency: "+tags[i]["amount"]));
      }
  });
}

function main() {
  getCompletionTime(1);
  getTagCoocurrence($("#tag-frequency .bar-chart"));
}

$(document).ready(main);
