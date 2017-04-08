function AuthUser(){	
	var cookies = document.cookie;
	console.log(cookies);
	var token = cookies.substr(6, cookies.length);
	console.log(token);

		$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/account/checktoken",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({token: token}),
	success: function (data) {
		getStatus();
	},
	error: function (data) {
	$("#failureModal").modal('show');
	}
});
			}

