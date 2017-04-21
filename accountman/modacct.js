function modAcct(){
//POST /api/account/update {token, firstname, lastname, password}
	cookies = document.cookie;
	token = cookies.substr(6, cookies.length);
		if($('#password_p').val() == $('#password_conf').val()){
		$.ajax({
		type: "POST",
		url: "https://smartparkproject.tk/api/account/update",
		dataType: "json",
		contentType:"application/json; charset=utf-8",
		data: JSON.stringify({token: token, firstname: ($('#f_name').val()).toString(), lastname: ($('#l_name').val()).toString() ,password:($('#password_p').val()).toString()}),
		success: function (data) {
			console.log(data);
			$('#modalTitle').text("Update Successful");
			$('#innerModal').text("Your account information has been successfully updated.");
			$('#checkModal').modal("show");;
		},
			error: function (data) {
				console.log(data);
		
		}	
	});
	}//if statement
	else{
		$('#modalTitle').text("Update Failed");
		$('#innerModal').text("Your passwords do not match. Please try again.");
		$('#checkModal').modal("show");
	}
}
