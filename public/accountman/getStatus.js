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
		$('#currstatus').text("Checked In");
		$('#currlot').text(data.result.lot);
		$('#currspot').text(data.result.spot);
	},
	error: function (data) {
		$('#currstatus').text("Not Currently Checked In");
		console.log(data);
	}
});
}

