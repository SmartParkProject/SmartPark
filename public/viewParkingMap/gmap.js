function initMap() {
	var map;
	if (navigator.geolocation) {
        var position = navigator.geolocation.getCurrentPosition(showPosition, postError);
	}
	else{

	  map = new google.maps.Map(document.getElementById("map"), {
          center: {lat: 43.0199770, lng: -83.6876530},
          zoom: 15
        });
	  getMapLocError(43.0199770, -83.6876530);
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
function postError(error){
	var map;
	switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
	    map = new google.maps.Map(document.getElementById("map"), {
            center: {lat: 43.0199770, lng: -83.6876530},
            zoom: 15
            });
		getMapLocError(43.0199770, -83.6876530);
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            map = new google.maps.Map(document.getElementById("map"), {
            center: {lat: 43.0199770, lng: -83.6876530},
            zoom: 15
            });
		getMapLocError(43.0199770, -83.6876530);
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            map = new google.maps.Map(document.getElementById("map"), {
            center: {lat: 43.0199770, lng: -83.6876530},
            zoom: 15
            });
		getMapLocError(43.0199770, -83.6876530);
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            map = new google.maps.Map(document.getElementById("map"), {
            center: {lat: 43.0199770, lng: -83.6876530},
            zoom: 15
            });
		getMapLocError(43.0199770, -83.6876530);
            break;
    }
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
function getMapLocError(lat, lng){
	$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/lot/search",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({lat: lat.toString(), lng: lng.toString(), distance: 100}),
	success: function (data) {
		//TODO: Create pins dynamically based on server results(Done)
		//var blah = JSON.parse(data.result[0].lat) <-this is structure!
		var arrayLength = data.result.length;
		//console.log(arrayLength);
		var mapOptions = {center: {lat: lat, lng: lng}, zoom: 15};
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
function writeToModal(id){
getcustMap(id);
}
function getcustMap(lotID){
	//var spotnum = $('#distance').val();
	//var url = "https://smartparkproject.tk/api/lot/"+spotnum+"/";
	let avail_array=[];
$.ajax({
	type: "GET",
	url: "https://smartparkproject.tk/api/lot/"+lotID+"/available",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
  success: function (data2) {
	//console.log(data2);
	for(var i=0; i < data2.result.length; i++)
	{
		avail_array[i] = data2.result[i];

	}
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
    image.onload = function(){
      mycanvas.width = image.width;
  		mycanvas.height = image.height;
  		ctx.drawImage(image,0,0);
  		for(var i = 0; i < stringin.length; i++){
  			let compare_num = avail_array[i];
  			if(avail_array[i]==1){
  			ctx.fillStyle = "green";
  			ctx.beginPath();
  			ctx.ellipse(x_array[i], (y_array[i]+20), 10, 10, 0, 0, 2 * Math.PI);
  			ctx.fill();
  			}
  			else if(avail_array[i]==0){
  				ctx.fillStyle="red";
  				ctx.beginPath();
  				ctx.rect((x_array[i]-9), (y_array[i]+5),20,20,0,0)
  				ctx.fill();
  			}
  		}
  		var image_out = mycanvas.toDataURL();
      console.log("OUT: " + image_out.length);
  		document.getElementById("mapimage").src=image_out;
  		$('#mapModal').modal("show");
    };
		image.src = "data:image/png;base64," + data.result.image_data;
	},
	error: function (data) {
		console.log(data);
	}
});
	},
	error: function(data){
		console.log("error");
	}
});

}
