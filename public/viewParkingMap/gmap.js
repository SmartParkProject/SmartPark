function initMap() {
	var map;
	if (navigator.geolocation) {
        var position = navigator.geolocation.getCurrentPosition(showPosition);
	}
	else{
	  map = new google.maps.Map(document.getElementById("map"), {
          center: {lat: 63.0199770, lng: -83.6876530},
          zoom: 15
        });
	}
      }
function showPosition(position) {
	var map;
	map = new google.maps.Map(document.getElementById("map"), {
          center: {lat: position.coords.latitude, lng: position.coords.longitude},
          zoom: 15
});
	getMapLoc(position);
}
function getMapLoc(position){
	$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/lot/search",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({lat: (position.coords.latitude).toString(), lng: (position.coords.longitude).toString(), distance: 100}),
	success: function (data) {
		//TODO: Create pins dynamically based on server results(Done)
		//var blah = JSON.parse(data.result[0].lat) <-this is structure!
		var arrayLength = data.result.length;
		//console.log(arrayLength);
		var mapOptions = {center: {lat: position.coords.latitude, lng: position.coords.longitude}, zoom: 15};
		var map = new google.maps.Map(document.getElementById("map"), mapOptions);

		for(var i = 0; i < arrayLength; i++)
		{
		var myLatLng = {lat: JSON.parse(data.result[i].lat), lng: JSON.parse(data.result[i].lng)};
		let marker = new google.maps.Marker({
                position: myLatLng,
		animation: google.maps.Animation.DROP,
                title: ((data.result[i].name).toString())
                });
		let infowindow = new google.maps.InfoWindow({
    			content: '<p>'+data.result[i].name+'</p>'+'<a class="btn btn-default" onClick="writeToModal('+data.result[i].id+')">Click to View Map</a>'
  			});
			//marker function
		marker.addListener('click', function(){
			if (marker.getAnimation() !== null) {
    				marker.setAnimation(null);
  			} else {
    			marker.setAnimation(google.maps.Animation.BOUNCE);
			infowindow.open(map, marker);
  			}});
		marker.setMap(map);
		//console.log(myLatLng);
		//console.log("Success");
		}//end for loop
		
	},
	error: function (data) {
		console.log(data);
	}
});
}
function writeToModal(id){//TODO: make this function show a modal from the getcustMap function below.
	getcustMap(id);
	$('#mapModal').modal("show");
}
function getcustMap(lotID){
	//var spotnum = $('#distance').val();
	//var url = "https://smartparkproject.tk/api/lot/"+spotnum+"/";
$.ajax({
	type: "GET",
	url: "https://smartparkproject.tk/api/lot/"+lotID+"/",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	success: function (data) {
		//console.log(data);
		var stringin = JSON.parse(data.result.spot_data);
		//console.log(stringin);
		var x_array = [];
		var y_array = [];
		var id_array = [];
		//console.log(JSON.parse(data.result.spot_data)[0].x);
		for(var i = 0; i < stringin.length; i++){
			x_array[i] = stringin[i].x;
			y_array[i] = stringin[i].y;
			id_array[i] = stringin[i].id;
			//console.log(x_array[i]);
		}
		var mycanvas = document.createElement("canvas");
		var ctx = mycanvas.getContext("2d");
		var image = new Image();
		image.src = "data:image/png;base64," + data.result.image_data;
		mycanvas.width = image.width;
		mycanvas.height = image.height;
		ctx.drawImage(image,0,0);
		for(var i = 0; i < stringin.length; i++){
			ctx.fillStyle = "green";
			ctx.beginPath();
			ctx.ellipse(x_array[i], y_array[i], 5, 5, 0, 0, 2 * Math.PI);
			ctx.fill();
		}
		var image_out = mycanvas.toDataURL();
		document.getElementById("mapimage").src=image_out;		
	},
	error: function (data) {
		console.log(data);
	}
});
}
