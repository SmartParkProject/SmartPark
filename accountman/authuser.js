function AuthUser(){	
	var cookies = document.cookie;
	//console.log(cookies);
	var token = cookies.substr(6, cookies.length);
	//console.log(token);

		$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/account/checktoken",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({token: token}),
	success: function (data) {
		getStatus();
		populateUser();
	},
	error: function (data) {
	$("#failureModal").modal('show');
	}
});
			}
function populateUser(){
	$.ajax({
		type: "POST",
		url: "https://smartparkproject.tk/api/account/details",
		dataType: "json",
		contentType:"application/json; charset=utf-8",
		data: JSON.stringify({token: token}),
		success: function (data) {
			console.log(data);
			$('#userf_name').text(data.result.firstname);
			$('#userl_name').text(data.result.lastname);
			$('#email_p').text(data.result.username);
		},
		error: function (data) {
			console.log(data);
		
		}	
	});
}
