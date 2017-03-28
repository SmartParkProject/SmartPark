window.onload = function(){
  document.getElementById("save_button").onclick = function(){
    var properties = {};
    properties.name = document.getElementById("name").value;
    properties.lat = parseFloat(document.getElementById("lat").value);
    properties.lng = parseFloat(document.getElementById("lng").value);
    if(isNaN(properties.lat) || isNaN(properties.lng))
      return alert("invalid latitude or longitude");
    parent.save(properties);
  }
}

function set(lot){
  document.getElementById("name").value = lot.name;
  document.getElementById("lat").value = lot.lat;
  document.getElementById("lng").value = lot.lng;
}
