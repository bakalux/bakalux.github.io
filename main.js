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

var margin = { top: 20, right: 20, bottom: 30, left: 50 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var svg = d3
  .select("main")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function drawGraph() {
  //graph
  // set the dimensions and margins of the graph

  // parse the date / time
  var parseTime = d3.timeParse("%M:%S:%L");

  // set the ranges
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // define the line
  var valueline = d3
    .line()
    .x(function(d) {
      console.log(d.date);
      return d.date;
    })
    .y(function(d) {
      console.log(d.value);
      return d.value;
    });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin

  // format the data
  dataArray.forEach(function(d) {
    d.date = parseTime(d.date);
    d.value = +d.value;
  });

  // Scale the range of the data
  x.domain(
    d3.extent(dataArray, function(d) {
      return d.date;
    })
  );
  y.domain([
    0,
    d3.max(dataArray, function(d) {
      return d.value;
    })
  ]);

  // Add the valueline path.
  svg
    .append("path")
    .data([dataArray])
    .attr("class", "line")
    .attr("d", valueline);
}
