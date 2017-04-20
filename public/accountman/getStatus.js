function getStatus(){
	cookies = document.cookie;
	token = cookies.substr(6, cookies.length);
$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/parking/status",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({token: token}),
	success: function (data) {
		//console.log(data);
			$.ajax({
				type: "POST",
				url: "https://smartparkproject.tk/api/account/permissions",
				dataType: "json",
				contentType:"application/json; charset=utf-8",
				data: JSON.stringify({token: token}),
				success: function (data2) {
					//console.log(data2);
					//$('#overviewParkStat').text("Checked In");
					$('#currstatus').text("Checked In");
					$('#currlot').text(data.result.LotId);
					$('#currspot').text(data.result.spot);
					$('#infract_header').text(data2.result[0].LotId);
					document.getElementById("infract").style.display = "inline-block";
					$('#lot').prop("disabled", true);
					$('#spot').prop("disabled", true);
					//console.log("success");
					getLotsStat();
				},
				error: function(data2){
					//console.log("failure");
					getLotsStat();
				}
			});
	},
	error: function (data) {
		//console.log(data);
		$.ajax({
				type: "POST",
				url: "https://smartparkproject.tk/api/account/permissions",
				dataType: "json",
				contentType:"application/json; charset=utf-8",
				data: JSON.stringify({token: token}),
				success: function (data2) {
					//console.log(data2);
					$('#currstatus').text("Not Currently Checked In");
					//$('#overviewParkStat').text("Not Currently Checked In");
					$('#infract_header').text("Parking Infraction Reports");
					//console.log("esuccess");
					document.getElementById("infract").style.display = "inline-block";
					getLotsStat();
				},
				error: function(data2){
					$('#currstatus').text("Not Currently Checked In");
					$('#overviewParkStat').text("Not Currently Checked In");
					//console.log("efailure");
					getLotsStat();
				}
			});

		
	}
});
}
function getLotsStat(){
	if (navigator.geolocation) {
        var position = navigator.geolocation.getCurrentPosition(showPositionStat, postError);
	}
	else{
		window.alert("Geolocation not enabled, unable to pull parking lots");
	}

}
function showPositionStat(position) {
	$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/lot/search",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({lat: (position.coords.latitude).toString(), lng: (position.coords.longitude).toString(), distance: 100}),
	success: function (data) {
		//console.log(data);
		//var stringin = (data.result[1].name).toString();
		//console.log(data.result[1].name);
		for(var i = 0; i < data.result.length; i++)
		{
			let newopt = document.createElement("option");
			newopt.text = (data.result[i].name).toString();
			newopt.value = (data.result[i].id).toString();
			let select = document.getElementById("lot");
			select.appendChild(newopt);
		}
		for(var i = 0; i < data.result.length; i++)
		{
			let newopt = document.createElement("option");
			newopt.text = (data.result[i].name).toString();
			newopt.value = (data.result[i].id).toString();
			let select2 = document.getElementById("infractLotSelect");
			select2.appendChild(newopt);
		}
		for(var i = 0; i < data.result.length; i++)
		{
			let newopt = document.createElement("option");
			newopt.text = (data.result[i].name).toString();
			newopt.value = (data.result[i].id).toString();
			let select3 = document.getElementById("adminSelect");
			select3.appendChild(newopt);
		}
	},
	error: function (data) {
		//console.log(data);
	}
});
}
function postError(error){
	switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
		$('#disclaimer').text("Current Location is not allowed. Please enable your location services.(DENIED ERROR)");
		$('#infractDis').text("Current Location is not allowed. Please enable your location services.(DENIED ERROR)");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
		$('#disclaimer').text("Current Location is unavailable. Unable to provide you with nearby parking lots. (UNAVAILIBLE ERROR)");
		$('#infractDis').text("Current Location is unavailable. Unable to provide you with nearby parking lots. (UNAVAILIBLE ERROR)");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
		$('#disclaimer').text("Current Location is unavailable. Unable to provide you with nearby parking lots. (TIMEOUT ERROR)");
		$('#infractDis').text("Current Location is unavailable. Unable to provide you with nearby parking lots. (TIMEOUT ERROR)");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
		$('#disclaimer').text("Current Location is unavailable. Unable to provide you with nearby parking lots. (UNKNOWN ERROR)");
		$('#infractDis').text("Current Location is unavailable. Unable to provide you with nearby parking lots. (TIMEOUT ERROR)");
            break;
    }
}
function report(value)
{
	var len = $('#spot').length;
	$('#spot').empty();
	//if(value==-1)
	//{
		//for(i = 1; i<len;i++)
		//{
		//	$('#spot')[i].removeChild();
		//}
	//}
	//else
	//{
	$.ajax({
	type: "GET",
	url: "https://smartparkproject.tk/api/lot/"+value+"/available",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	success: function (data) {
		console.log(data);
		for(var i = 0; i < data.result.length;i++)
		{
			if(data.result[i] != 0)
			{
			let newopt = document.createElement("option");
			newopt.text = (i).toString();
			newopt.value = i;
			let select = document.getElementById("spot");
			select.appendChild(newopt);
			}
		}
	},
	error: function(data){
		console.log(data);
	}
});
	//}
}
function submitReport(){
	cookies = document.cookie;
	token = cookies.substr(6, cookies.length);
	$.ajax({
	type: "POST",
	url: "https://smartparkproject.tk/api/infraction",
	dataType: "json",
	contentType:"application/json; charset=utf-8",
	data: JSON.stringify({description: $('#comment').val(),token: token, lotid:Number($('#infractLotSelect').val())}),
	success: function (data) {
		console.log(data, "success");
		$("#infractText").text("Infraction Report Successfully Submitted.");
		$('#infractModal').modal("show");
		$('#comment').val('');
		
	},
	error: function(data){
		console.log(data);
		$("#infractText").text("Infraction report submission failure. Please check your information to see if it is correct.");
		$('#infractModal').modal("show");
		$('#comment').val('');
	}
});
}
function populateTable(value){
	var len = document.getElementById('infractTable').rows.length;
	if((document.getElementById('infractTable').rows.length) > 1){
		for(var i=1; i < len; i++)
		{
			document.getElementById("infractTable").deleteRow(1);
		}
	}
	cookies = document.cookie;
	token = cookies.substr(6, cookies.length);
		$.ajax({
		type: "POST",
		url: "https://smartparkproject.tk/api/lot/"+value+"/infractions",
		dataType: "json",
		contentType:"application/json; charset=utf-8",
		data: JSON.stringify({token: token}),
		success: function (data) {
			console.log(data, "success");
			//var row = document.getElementById("infractTable").insertRow(1);
			//var row2 = document.getElementById("infractTable").insertRow(2);
			//var cell = row.insertCell(0);
			//var cell2 = row2.insertCell(0);
			//cell.innerHTML="blah";
			//cell2.innerHTML="blah";
			for(var i=1; i <= data.result.length; i++){
				$('#infractError').text("");
				let row = document.getElementById('infractTable').insertRow(i);
				let cell = row.insertCell(0);
				let cell2 = row.insertCell(1);
				let cell3 = row.insertCell(2);
				let cell4 = row.insertCell(3);
				let cell5 = row.insertCell(4);
				let cell6 = row.insertCell(5);
				let cell7 = row.insertCell(6);
				cell.innerHTML = (data.result[i-1].UserId).toString();
				cell2.innerHTML = (data.result[i-1].LotId).toString();
				cell3.innerHTML = (data.result[i-1].id).toString();
				cell4.innerHTML = (data.result[i-1].createdAt).toString();
				cell5.innerHTML = (data.result[i-1].description).toString();
				if(data.result[i-1].image_data == null){
					cell6.innerHTML = "No Picture";
				}
				else{
					cell6.innerHTML = "<a class='btn btn-success'>View Image</a>";//TODO: get this to correctly draw an image in a modal//
				}
				cell7.innerHTML = "<a class='btn btn-default' onclick='resolveInfraction("+data.result[i-1].id+","+data.result[i-1].LotId+")'>Resolve</a>";
			}
			
		},
		error: function (data) {
			$('#infractError').text("You do not have permission for this table.");
			console.log(data, "error");
		}
	});
}
function resolveInfraction(value, lotid){//TODO: Get this call to work. Seems to not want to behave...//
	$.ajax({
		type: "POST",
		url: "https://smartparkproject.tk/api/lot/"+lotid+"/events/"+value+"/resolve",
		dataType: "json",
		contentType:"application/json; charset=utf-8",
		data: JSON.stringify({token: token}),
		success: function (data) {
			console.log(data, "success");
			
		},
		error: function (data) {
			console.log(data, "error");
		}
	});
}
