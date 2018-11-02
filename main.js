let globalIdCounter = 0;
let dataArray = [];

document.getElementById("data").addEventListener("keyup", function(e) {
  e.preventDefault();
  if (e.keyCode === 13) {
    addData();
    document.getElementById("data").value = "";
  }
});

function addData() {
  const value = document.getElementById("data").value;
  const date = new Date();
  const data = {
    id: globalIdCounter,
    date: date,
    value: value
  };
  dataArray.push(data);
  addToDOM(data);
  globalIdCounter++;
  console.log(dataArray);
  listenToRemove();
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
    button.addEventListener("click", function() {
      dataArray = dataArray.filter(function(data) {
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
