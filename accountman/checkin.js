function checkin(){
	cookies = document.cookie;
	token = cookies.substr(6, cookies.length);
	//console.log($('#lot').val());
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
		$('#modalTitle').text("Parking Status: Success!");
		$('#innerModal').text("Checked into Lot "+$('#lot').val()+" and spot "+$('#spot').val()+".");
		$('#lot').prop("disabled", true);
		$('#spot').prop("disabled", true);
		$('#checkModal').modal("show");

		
	},
	error: function (data) {
		console.log(data);
		$('#modalTitle').text("Parking Status: Failure");
		$('#innerModal').text("You may have already been checked into another parking spot, or the spot is no longer available. Please review your options and try again.");
		$('#checkModal').modal("show");
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
		$('#modalTitle').text("Parking Status: Successfully Checked out!");
		$('#innerModal').text("You are no longer parked into the spot. Thank you");
		$('#lot').prop("disabled", false);
		$('#spot').prop("disabled", false);
		$('#checkModal').modal("show");
	},
	error: function (data) {
		console.log(data);
		$('#modalTitle').text("Parking Status: Error");
		$('#innerModal').text("You are not checked into a parking spot. Unable to complete your request. Please Review your options and try again.");
		$('#checkModal').modal("show");
	}
});
}
