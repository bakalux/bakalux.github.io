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
  const buttons = document.getElementsByClassName("remove");
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

const width = 500;
const height = 500;

// Set the scales ranges
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const svg = d3
  .select(".svg-container")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 150 500")
  .append("g");

function type(dataArray) {
  dataArray.forEach(d => {
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
    .x(d => {
      return x(d.date);
    })
    .y(d => {
      return y(d.value);
    });

  // set the domain range from the data
  x.domain([
    d3.min(data, d => {
      return Math.floor(d.date - 100);
    }),
    d3.max(data, d => {
      return Math.floor(d.date + 100);
    })
  ]);

  y.domain(
    d3.extent(data, d => {
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

//Triangle buttons

const left = document.getElementById("left-button");
const right = document.getElementById("right-button");
const leftBlock = document.getElementById("left-block");
const rightBlock = document.getElementById("right-block");

let rightIsOpened = true;
let leftIsOpened = true;
left.addEventListener("click", () => {
  if (leftIsOpened === true) {
    leftBlock.style.display = "none";
    left.style.transform = "rotate(135deg)";
    left.style.left = "-4%";
    leftIsOpened = false;
  } else {
    leftBlock.style.display = "block";
    left.style.transform = "rotate(315deg)";
    left.style.left = "-3%";
    leftIsOpened = true;
  }
});

right.addEventListener("click", () => {
  if (rightIsOpened === true) {
    rightBlock.style.display = "none";
    right.style.transform = "rotate(315deg)";
    right.style.right = "-4%";
    rightIsOpened = false;
  } else {
    rightBlock.style.display = "block";
    right.style.transform = "rotate(135deg)";
    right.style.right = "-3%";
    rightIsOpened = true;
  }
});
