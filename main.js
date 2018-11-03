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
    });
  }
}

var margin = { top: 30, right: 20, bottom: 30, left: 50 },
  width = 500 - margin.left - margin.right,
  height = 250 - margin.top - margin.bottom;

// Set the scales ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Define the axes
var xAxis = d3.axisBottom().scale(x);
var yAxis = d3.axisLeft().scale(y);

var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function drawGraph() {
  // Parse the date / time

  // force types
  function type(dataArray) {
    dataArray.forEach(function(d) {
      d.date = new Date(d.date).getTime;
      d.value = +d.value;
    });
    return dataArray;
  }
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

  // Add the svg canvas

  // set the domain range from the data
  x.domain([
    d3.min(data, function(d) {
      return Math.floor(d.date - 20000);
    }),
    d3.max(data, function(d) {
      return Math.floor(d.date + 20000);
    })
  ]);

  y.domain(
    d3.extent(data, function(d) {
      return d.value;
    })
  );
  // draw the line created above
  svg
    .append("path")
    .data([data])
    .style("fill", "none")
    .style("stroke", "steelblue")
    .style("stroke-width", "2px")
    .attr("d", line);

  // Add the X Axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the Y Axis
  svg.append("g").call(yAxis);
}
