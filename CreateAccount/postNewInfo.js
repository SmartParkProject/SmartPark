function postNewInfo(){
		var fname = $('#fname').val();
		var lname = $('#lname').val();
		var name = "token";
		deleteCookie(name, '/');
		if($('#password').val() ==$('#cpassword').val())
		{$.ajax({
		type: "POST",
		url: "https://smartparkproject.tk/api/account/register",
		dataType: "json",
		contentType:"application/json; charset=utf-8",
		data: JSON.stringify({firstname: fname, lastname: lname, username: $('#email').val(), password: $('#password').val()}),
		success: function (data) {
			console.log(data);
			$.ajax({
			type: "POST",
			url: "https://smartparkproject.tk/api/account/login",
			dataType: "json",
			contentType:"application/json; charset=utf-8",
			data: JSON.stringify({username: $('#email').val(), password: $('#password').val()}),
			success: function (data2) {
			console.log(data2);
			let value = data2.result;
			setCookie(name, value, 7, '/');
			window.location.replace("/accountman");
				}
			});
		},
		error: function (data) {
		$("#failureModal").modal('show');
		}
	});}
		else
		{
			$('#badpassmodal').modal('show');
		}
		
}
function setCookie(name, value, days=7, path = '/'){
	const expires = new Date(Date.now() + days * 864e5).toGMTString()
  	document.cookie = name + `=${encodeURIComponent(value)}; expires=${expires}; path=` + path
}
function deleteCookie(name, path= '/'){
	setCookie(name, '', -1, path);
}
