let idCounter = 0;
let dataArray = [];

const width = 1100;
const height = 520;

// Set the scales ranges

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const svg = d3
  .select(".svg-container")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 1107 520")
  .append("g");

getFromStorage();

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
  listenToRemove();
  drawGraph();
  moveToStorage();
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
  for (let button of buttons) {
    button.addEventListener("click", () => {
      dataArray = dataArray.filter(data => {
        if (typeof data !== undefined) {
          return parseInt(data.id) !== parseInt(button.id);
        }
      });
      button.parentNode.remove();
      button = document.getElementsByClassName("remove");
      moveToStorage();
      drawGraph();
    });
  }
}

function moveToStorage() {
  const serialObj = JSON.stringify(dataArray);
  localStorage.setItem("data", serialObj);
  localStorage.setItem("id", idCounter);
}

function getFromStorage() {
  dataArray = JSON.parse(localStorage.getItem("data"));
  if (dataArray !== null) {
    dataArray.forEach(elem => {
      const data = {
        id: elem.id,
        date: new Date(elem.date),
        value: +elem.value
      };
      addToDOM(data);
      drawGraph();
    });
    idCounter = localStorage.getItem("id");
    listenToRemove();
  } else {
    dataArray = [];
    idCounter = 0;
  }
}

function type(dataArray) {
  dataArray.forEach(d => {
    d.date = new Date(d.date).getTime();
    d.value = +d.value;
  });
  return dataArray;
}

function drawGraph() {
  d3.selectAll("path").remove();
  d3.selectAll("text").remove();
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

  svg
    .selectAll(".text")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => {
      return x(d.date);
    })
    .attr("y", d => {
      return y(d.value);
    })
    .attr("dy", ".75em")
    .text(d => {
      return d.value;
    });
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
    leftBlock.classList.toggle("closed");
    left.style.transform = "rotate(135deg)";
    left.style.left = "-4%";
    leftIsOpened = false;
  } else {
    leftBlock.classList.toggle("closed");
    left.style.transform = "rotate(315deg)";
    left.style.left = "-3%";
    leftIsOpened = true;
  }
});

right.addEventListener("click", () => {
  if (rightIsOpened === true) {
    rightBlock.classList.toggle("closed");
    right.style.transform = "rotate(315deg)";
    right.style.right = "-4%";
    rightIsOpened = false;
  } else {
    rightBlock.classList.toggle("closed");
    right.style.transform = "rotate(135deg)";
    right.style.right = "-3%";
    rightIsOpened = true;
  }
});

//animation
