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
		$('#overviewParkStat').text("Checked In");
		$('#currstatus').text("Checked In");
		$('#currlot').text(data.result.lot);
		$('#currspot').text(data.result.spot);
		getLots();
	},
	error: function (data) {
		$('#currstatus').text("Not Currently Checked In");
		$('#overviewParkStat').text("Not Currently Checked In");
		console.log(data);
		getLots();
	}
});
}
function getLots(){
	if (navigator.geolocation) {
        var position = navigator.geolocation.getCurrentPosition(showPosition);
	}
	else{
		window.alert("Geolocation not enabled, unable to pull parking lots");
	}

}
function showPosition(position) {
	$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/lot/search",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({lat: (position.coords.latitude).toString(), lng: (position.coords.longitude).toString(), distance: 100}),
	success: function (data) {
		console.log(data);
		//var stringin = (data.result[1].name).toString();
		console.log(data.result[1].name);
		for(var i = 0; i < 2; i++)
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
function report(value)
{
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
		for(var i = 1; i < data.result.length;i++)
		{
			if(data.result[i] != 0)
			{
				let newopt = document.createElement("option");
			newopt.text = (i).toString();
			newopt.value = (data.result[i]).toString();
			let select = document.getElementById("spot");
			select.appendChild(newopt);
			}
		}
	},
	error: function(data){
		
	}
});
	}
}