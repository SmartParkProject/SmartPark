function AuthUser(){
	cookies = document.cookie;
	console.log(cookies);
	token = cookies.substr(6, cookies.length);
		$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/account/checktoken",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({token: token}),
	success: function (data) {
	},
	error: function (data) {
	$("#failureModal").modal('show');
	}
});
			}

