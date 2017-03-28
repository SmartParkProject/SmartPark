function checkin(){
	cookies = document.cookie;
	token = cookies.substr(6, cookies.length);
	
$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/parking/",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({token: token,spot: Number($('#spot').val()),lot: Number($('#lot').val())}),
	success: function (data) {
		console.log(data);
		$('#currlot').text($('#lot').val());
		$('#currspot').text($('#spot').val());
		$('#currstatus').text("Checked In");
		
	},
	error: function (data) {
		console.log(data);
	}
});
}
function checkout(){
	cookies = document.cookie;
	token = cookies.substr(6, cookies.length);
	
$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/payment/checkout",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({token: token}),
	success: function (data) {
		console.log(data);
		$('#currlot').text("None");
		$('#currspot').text("None");
		$('#currstatus').text("Not Currently Checked In");
	},
	error: function (data) {
		console.log(data);
	}
});
}
