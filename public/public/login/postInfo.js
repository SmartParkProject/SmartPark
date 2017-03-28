function postInfo(){
				$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/account/login",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({username: $('#usernamein').val(), password: $('#password').val()}),
	success: function (data) {
		console.log(data);
		document.cookie = "token="+data.result;
		window.location.replace("/accountman");
	},
	error: function (data) {
	var obj = JSON.parse(data.responseText);
		console.log(data.responseText);
	$("#failureModal").modal('show');
	}
});
}
