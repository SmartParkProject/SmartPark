function display_warning(){
	$("#warnModal").modal('show');
}

function crack_token(){
	var old_cookie = document.cookie;
	document.cookie = old_cookie + " expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
