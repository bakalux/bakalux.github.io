let idCounter = 0;
let dataArray = [];

document.getElementById("data").addEventListener("submit", e => {
  e.preventDefault();
  addData();
  document.getElementById("input").value = "";
});

function addData() {
  const value = document.getElementById("input").value;
  const data = {
    id: idCounter,
    date: new Date(),
    value: +value
  };
  dataArray.push(data);
  addToDOM(data);
  idCounter++;
  console.log(dataArray);
  listenToRemove();
  drawGraph();
}

function addToDOM(data) {
  document.getElementById("values").innerHTML += `
  <li class="value">
    <span class="time">${data.date.getMinutes()}:${data.date.getSeconds()}:${data.date.getMilliseconds()}
  </span>
    <span class="number">${data.value}</span>
    <button class="remove" id=${data.id}>Remove</button>
  </li>  
  `;
}

function listenToRemove() {
  let buttons = document.getElementsByClassName("remove");
  console.log(buttons);
  for (let button of buttons) {
    button.addEventListener("click", () => {
      dataArray = dataArray.filter(data => {
        if (typeof data !== undefined) {
          return parseInt(data.id) !== parseInt(button.id);
        }
      });
      button.parentNode.remove();
      console.log(dataArray);
      button = document.getElementsByClassName("remove");
      drawGraph();
    });
  }
}

var width = 500;
var height = 350;

// Set the scales ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var svg = d3
  .select("main")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 500 350")
  .classed("svg-content-responsive", true)
  .append("g");

function type(dataArray) {
  dataArray.forEach(function(d) {
    d.date = new Date(d.date).getTime();
    d.value = +d.value;
  });
  return dataArray;
}

function drawGraph() {
  d3.selectAll("path").remove();
  // force types
  data = type(dataArray);

  // create a line based on the data
  var line = d3
    .line()
    .x(function(d) {
      return x(d.date);
    })
    .y(function(d) {
      return y(d.value);
    });

  // set the domain range from the data
  x.domain([
    d3.min(data, function(d) {
      return Math.floor(d.date - 100);
    }),
    d3.max(data, function(d) {
      return Math.floor(d.date + 100);
    })
  ]);

  y.domain(
    d3.extent(data, function(d) {
      return d.value;
    })
  );

  svg
    .append("path")
    .data([data])
    .style("fill", "none")
    .style("stroke", "steelblue")
    .style("stroke-width", "2px")
    .attr("d", line);
}
