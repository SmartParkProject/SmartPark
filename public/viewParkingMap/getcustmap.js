function getMap(){
$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/lot/search",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({lat: $('#lat').val(), lng: $('#lng').val(), distance: Number($('#distance').val())}),
	success: function (data) {
		console.log(data);
	},
	error: function (data) {
		console.log(data);
	}
});
}
function getcustMap(){
	var spotnum = $('#distance').val();
	var url = "https://smartparkproject.tk/api/lot/"+spotnum+"/";
$.ajax({
	type: "GET",
	url: url,
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	success: function (data) {
		console.log(data);
		var stringin = JSON.parse(data.result.spot_data);
		console.log(stringin);
		var x_array = [];
		var y_array = [];
		var id_array = [];
		console.log(JSON.parse(data.result.spot_data)[0].x);
		for(var i = 0; i < stringin.length; i++){
			x_array[i] = stringin[i].x;
			y_array[i] = stringin[i].y;
			id_array[i] = stringin[i].id;
			console.log(x_array[i]);
		}
		var mycanvas = document.createElement("canvas");
		var ctx = mycanvas.getContext("2d");
		var image = new Image();
		image.src = "data:image/png;base64," + data.result.image_data;
		mycanvas.width = image.height;
		mycanvas.height = image.width;
		ctx.drawImage(image,0,0);
		for(var i = 0; i < stringin.length; i++){
			ctx.fillStyle = "green";
			ctx.beginPath();
			ctx.ellipse(x_array[i], y_array[i], 30, 30, 45*Math.PI/180, Math.PI, 2 * Math.PI);
			ctx.fill();
		}
		var image_out = mycanvas.toDataURL();
		document.getElementById("canvas").src=image_out;		
	},
	error: function (data) {
		console.log(data);
	}
});
}

