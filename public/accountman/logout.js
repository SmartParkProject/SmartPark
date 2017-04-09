function display_warning(){
	$("#warnModal").modal('show');
}

function crack_token(){
	var cookies = document.cookie;
	console.log(cookies);
	 var token = cookies.substr(6, cookies.length);
	$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/account/logout",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({token: token}),
	success: function (data) {
		console.log(data);
		document.cookie = "token=;path=/";
	},
	error: function (data) {
		document.cookie = "token=;path=/";
	}
});
}
