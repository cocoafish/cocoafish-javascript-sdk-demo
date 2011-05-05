// Sign up at http://cocoafish.com and create an app.
// Insert your Cocoafish app API key here.
var sdk = new CocoafishWithKey('<insert api key here>');

function loginUser(userLogin, passwd) {
	sdk.loginUser({login:userLogin, password: passwd}, function(data) {
		if(data && data.meta && data.meta.code == 200) {
			window.location = 'places.html';
		}
	});
}

function logoutUser() {
	sdk.logoutUser(function(data) {
		if(data && data.meta && data.meta.code == 200) {
			window.location = 'login.html';
		}
	});
}

function loadSignUp() {
	$.ajax({
		url: 'signup.html',
		success: function(data) {
			$('#mainArea').html(data);
		}
	});
}

function createUser(email, fName, lName, password, pwd_confirm) {
	sdk.createUser({email: email, first_name: fName, last_name: lName, password: password, password_confirmation: pwd_confirm}, function(data) {
		if(data && data.meta && data.meta.code == 200) {
			window.location = 'places.html';
		}
	});
}

function getPlaces() {
	sdk.findPlaces('', function(data) {
		if(data) {
			if(data.meta) {
				if(data.meta.code == '200' && data.meta.stat == 'ok' && data.meta.method == 'searchPlaces') {
					initializeMap(data.response.places);
					createPlacesGrid(data.response.places);
				}
			}
		}
	});
}

function createPlacesGrid(places) {
	  if(places) {
		  $("#placesGrid").jqGrid({
				datatype: "local",
			   	colNames:['Name','Address', 'City', 'State','Country','Check In', 'ID'],
			   	colModel:[
			   		{name:'name',index:'name', width:200, sorttype:"string"},
			   		{name:'address',index:'address', width:200, sorttype:"string"},
			   		{name:'city',index:'city', width:100, sorttype:"string"},
			   		{name:'state',index:'state', width:80,align:"center",sorttype:"string"},
			   		{name:'country',index:'country', width:80,sorttype:"string"},	
			   		{name:'checkin',index:'checkin', width:100, sortable:false, align:"center", formatter: checkInFormatter},
			   		{name:'id',index:'id', hidden:true}
			   	],
			   	multiselect: false,
			   	height: "100%",
			   	altRows: true,
			   	rownumbers:true,
			   	autowidth:true,
			   	caption: "  All Places"
			});
		  	for(var i=0;i<=places.length;i++)
				$("#placesGrid").jqGrid('addRowData', i+1 , places[i]);
	  }
}

function initializeMap(places) {
    var bounds = new google.maps.LatLngBounds();
    var markers = new Array();
    if(places && places.length) {
    		for(var i=0;i<places.length;i++) {
    			var latlng = new google.maps.LatLng(places[i].latitude, places[i].longitude);
    			bounds.extend(latlng);
    			var marker = new google.maps.Marker({
    				position: latlng,
    				title: places[i].name
    			});
    			markers[i] = marker;
    		}
    }
    
    var myOptions = {
      zoom: 16,
      center: bounds.getCenter(),
      //center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      panControl:true
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
		map.fitBounds(bounds);
    
    var infowindow = new google.maps.InfoWindow({
    		content: 'Hello world' 
    });
    
    for(var i=0;i<markers.length;i++) {
    		markers[i].setAnimation(google.maps.Animation.DROP);
    		markers[i].setMap(map);
    		createMarkerListeners(markers[i], places[i], map, infowindow);
  	}			    
}

function createMarkerListeners(marker, place, map, infowindow) {
  	google.maps.event.addListener(marker, 'click', function(event) {
  		infowindow.close();
  		infowindow.setContent("<span style='font-size:12px'>" + place.name + "</span>");
  		infowindow.open(map, marker);
  	});
}

function checkInFormatter(cellvalue, options, rowObject) {
  return '<a href="javascript:void(0)" onclick="checkinPlace(\'' + rowObject.id + '\')"><span class="ui-icon ui-icon-circle-check" style="margin:0 auto;cursor:hand"/></a>';
}

function checkinPlace(placeId) {
	  if(placeId) {
		  sdk.checkinPlaceOrEvent({place_id:placeId}, function(data) {
			  if(data) {
					if(data.meta) {
						if(data.meta.code == '200' && data.meta.stat == 'ok' && data.meta.method == 'createCheckin') {
							alert('Check in successful!');
						}
					}
				}
			});
	  }
}