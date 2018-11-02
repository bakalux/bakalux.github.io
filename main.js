let globalIdCounter = 0;
let dataArray = [];

document.getElementById("data").addEventListener("keyup", function(e) {
  e.preventDefault();
  if (e.keyCode === 13) {
    addData();
    document.getElementById("data").value = "";
  }
});
/*
document.getElementsByClassName("remove").onclick = function(e) {
  alert(e.target.parentNode.id);
};
*/
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
}

function addToDOM(data) {
  document.getElementById("values").innerHTML += `
  <li class="value" id=${data.id}>
    <span class="time">${data.date.getMinutes()}:${data.date.getSeconds()}:${data.date.getMilliseconds()}
  </span>
    <span class="number">${data.value}</span>
    <button class="remove">Remove</button>
  </li>  
  `;
}
