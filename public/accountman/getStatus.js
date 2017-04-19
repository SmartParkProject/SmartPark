function getStatus(){
	cookies = document.cookie;
	token = cookies.substr(6, cookies.length);
$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/parking/status",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({token: token}),
	success: function (data) {
		console.log(data);
			$.ajax({
				type: "POST",
				url: "https://smartparkproject.tk/api/account/permissions",
				dataType: "json",
				contentType:"application/json; charset=utf-8",
				data: JSON.stringify({token: token}),
				success: function (data2) {
					console.log(data2);
					$('#overviewParkStat').text("Checked In");
					$('#currstatus').text("Checked In");
					$('#currlot').text(data.result.LotId);
					$('#currspot').text(data.result.spot);
					$('#infract_header').text(data2.result[0].LotId);
					document.getElementById("infract").style.display = "inline-block";
					console.log("success");
					getLots();
				},
				error: function(data2){
					console.log("failure");
					getLots();
				}
			});
	},
	error: function (data) {
		console.log(data);
		$.ajax({
				type: "POST",
				url: "https://smartparkproject.tk/api/account/permissions",
				dataType: "json",
				contentType:"application/json; charset=utf-8",
				data: JSON.stringify({token: token}),
				success: function (data2) {
					console.log(data2);
					$('#currstatus').text("Not Currently Checked In");
					$('#overviewParkStat').text("Not Currently Checked In");
					$('#infract_header').text("Parking Infraction Reports for lot "+data2.result[0].LotId);
					console.log("esuccess");
					document.getElementById("infract").style.display = "inline-block";
					getLotsStat();
				},
				error: function(data2){
					$('#currstatus').text("Not Currently Checked In");
					$('#overviewParkStat').text("Not Currently Checked In");
					console.log("efailure");
					getLotsStat();
				}
			});

		
	}
});
}
function getLotsStat(){
	if (navigator.geolocation) {
        var position = navigator.geolocation.getCurrentPosition(showPositionStat, postError);
	}
	else{
		window.alert("Geolocation not enabled, unable to pull parking lots");
	}

}
function showPositionStat(position) {
	$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/lot/search",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({lat: (position.coords.latitude).toString(), lng: (position.coords.longitude).toString(), distance: 100}),
	success: function (data) {
		console.log(data);
		//var stringin = (data.result[1].name).toString();
		//console.log(data.result[1].name);
		for(var i = 0; i < data.result.length; i++)
		{
			let newopt = document.createElement("option");
			newopt.text = (data.result[i].name).toString();
			newopt.value = (data.result[i].id).toString();
			let select = document.getElementById("lot");
			select.appendChild(newopt);
		}
	},
	error: function (data) {
		console.log(data);
	}
});
}
function postError(error){
	switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
		$('#disclaimer').text("Current Location is not allowed. Please enable your location services.(DENIED ERROR)");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
		$('#disclaimer').text("Current Location is unavailable. Unable to provide you with nearby parking lots. (UNAVAILIBLE ERROR)");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
		$('#disclaimer').text("Current Location is unavailable. Unable to provide you with nearby parking lots. (TIMEOUT ERROR)");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
		$('#disclaimer').text("Current Location is unavailable. Unable to provide you with nearby parking lots. (UNKNOWN ERROR)");
            break;
    }
}
function report(value)
{
	let len = $('#spot').length;
	for(i = 1; i<len;i++)
	{
		$('#spot')[i].removeChild();
	}
	if(value=="")
	{}
	else
	{
		$.ajax({
	type: "GET",
	url: "https://smartparkproject.tk/api/lot/"+value+"/available",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	success: function (data) {
		console.log(data);
		for(var i = 0; i < data.result.length;i++)
		{
			if(data.result[i] != 0)
			{
				let newopt = document.createElement("option");
			newopt.text = (i).toString();
			newopt.value = i;
			let select = document.getElementById("spot");
			select.appendChild(newopt);
			}
		}
	},
	error: function(data){
		console.log(data);
	}
});
	}
}
