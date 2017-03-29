window.onload = function(){
  document.getElementById("save_button").onclick = function(){
    var properties = {};
    properties.name = document.getElementById("name").value;
    properties.lat = parseFloat(document.getElementById("lat").value);
    properties.lng = parseFloat(document.getElementById("lng").value);
    if(isNaN(properties.lat) || isNaN(properties.lng))
      return alert("invalid latitude or longitude");
    parent.save(properties, function(){
      displayMessage("Lot saved.");
    });
  }
}

function set(lot){
  document.getElementById("name").value = lot.name;
  document.getElementById("lat").value = lot.lat;
  document.getElementById("lng").value = lot.lng;
}

var timeout;
function displayMessage(message){
  document.getElementById("output").innerHTML = message;
  clearTimeout(timeout);
  timeout = setTimeout(function(){
    document.getElementById("output").innerHTML = "";
  }, 2000);
}
