var token;
var lotid;
var permissions = ["Owner", "Guard"];

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
  document.getElementById("member_button").onclick = function(){
    if(!lotid) return displayMessage("The lot must be saved before permissions can be set.");
    var username = document.getElementById("member").value;
    var level = parseInt(document.getElementById("level").value, 10);

    var url = "/api/lot/" + lotid + "/user";
    var data = {
      token: token,
      username: username,
      level: level
    };
    parent.sendJSON("POST", url, data, function(response){
      document.getElementById("list").innerHTML = "Loading...";
      getMembers();
    }, function(response){
      displayMessage(response.message);
    });

    document.getElementById("member").value = "";
  }
  document.getElementById("update_button").onclick = function(){
    var width = parseInt(document.getElementById("width").value, 10);
    var height = parseInt(document.getElementById("height").value, 10);
    if(width < 10 || width > 5000) return;
    if(height < 10 || height > 5000) return;
    parent.setSize(width, height);
  }
}

function getMembers(){
  document.getElementById("list").innerHTML = "";
  var url = "/api/lot/" + lotid + "/users";
  var data = {
    token: token
  };
  parent.sendJSON("POST", url, data, function(response){
    for(var i = 0; i < response.result.length; i++){
      let elem = document.createElement("div");
      var item = response.result[i].User.username + " - " + permissions[response.result[i].level];
      elem.innerHTML = item;
      document.getElementById("list").appendChild(elem);
    }
  });
}

function set(lot, token){
  this.token = token;
  this.lotid = lot.id;
  document.getElementById("name").value = lot.name;
  document.getElementById("lat").value = lot.lat;
  document.getElementById("lng").value = lot.lng;

  document.getElementById("width").value = parent.STAGE_WIDTH;
  document.getElementById("height").value = parent.STAGE_HEIGHT;
  getMembers();
}

var timeout;
function displayMessage(message){
  document.getElementById("output").innerHTML = message;
  clearTimeout(timeout);
  timeout = setTimeout(function(){
    document.getElementById("output").innerHTML = "";
  }, 2000);
}
