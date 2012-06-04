// Sign up at http://cocoafish.com and create an app.
// Insert your Cocoafish app API key here.
var sdk = new Cocoafish('<insert api key here>');

//use client_id to initialize SDK
//var sdk = new Cocoafish2('VGJSVgFHs7FaOcgcvMWMAGe6bwNpHBfq');

//use client_id and redirect_uri to initialize SDK. redirect_uri can also be specified when calling
//sdk.sendAuthRequest and sdk.invalidateTokenRequest.
var sdk = new Cocoafish2('VGJSVgFHs7FaOcgcvMWMAGe6bwNpHBfq',
                            'http://localhost/cocoafish-javascript-sdk-demo/connect.html');

sdk.apiBaseURL = 'localhost:3000'

var userId;

//for Cococafish2 only - start
//These callbacks are used to implement custom mechanism to save/retrieve/clear access tokens
//If no custom callbacks are implemented Cocoafish2 will do just as the following code does.
/*
sdk.saveToken = function(access_token, app_key) {
    //alert('saveToken called!');
    com.cocoafish.js.sdk.utils.setCookie(com.cocoafish.constants.accessToken, access_token);
    com.cocoafish.js.sdk.utils.setCookie(com.cocoafish.constants.appKey, app_key);
};

sdk.getToken = function() {
    //alert('getToken called!');
    return com.cocoafish.js.sdk.utils.getCookie(com.cocoafish.constants.accessToken);
}

sdk.getAppKey = function() {
    //alert('getAppKey called!');
    return com.cocoafish.js.sdk.utils.getCookie(com.cocoafish.constants.appKey);
}

sdk.clearToken = function() {
    //alert('clearToken called!');
    com.cocoafish.js.sdk.utils.setCookie(com.cocoafish.constants.accessToken, '');
    com.cocoafish.js.sdk.utils.setCookie(com.cocoafish.constants.appKey, '');
}
*/
//for Cocoafish2 only - end


function loginUser(userLogin, passwd) {
	$('#container').showLoading();
	sdk.sendRequest('users/login.json', 'POST', {login:userLogin, password: passwd}, function(responseData) {
		if(responseData && responseData.meta && responseData.meta.code == 200) {
			window.location = 'places.html';
		} else {
			alert(responseData.meta.message);
			$('#container').hideLoading();
		}
	});
}

function logoutUser() {
    if(sdk instanceof Cocoafish2) {
        if(confirm('Are you sure want to Disconnect?')) {
            //Cocoafish2.invalidateTokenRequest() will call clearToken to invalidate the token at client side
            //redirect_uri can be specified here
            //sdk.invalidateTokenRequest('http://localhost/cocoafish-javascript-sdk-demo/connect.html');
            sdk.invalidateTokenRequest();
        }
    } else {
        if(confirm('Are you sure want to logout?')) {
            sdk.sendRequest('users/logout.json', 'GET', null, function(responseData) {
                if(responseData && responseData.meta && responseData.meta.code == 200) {
                    window.location = 'login.html';
                }
            });
        }
    }
}

function loadSignUp() {
	$('#container').showLoading();
	$.ajax({
		url: 'signup.html',
		success: function(data) {
			$('#mainArea').html(data);
			$('#container').hideLoading();
		}
	});
}

function createUser(email, fName, lName, password, pwd_confirm) {
	var userData = {
			email: email, 
			first_name: fName, 
			last_name: lName, 
			password: password, 
			password_confirmation: pwd_confirm
	};
	sdk.sendRequest('users/create.json', 'POST', userData, function(data) {
		if(data && data.meta && data.meta.code == 200) {
			window.location = 'places.html';
		} else {
			alert(data.meta.message)
		}
	});
}

function testAuthUser(callback, errorCallback, loadingArea) {
	loadingArea.showLoading();
	sdk.sendRequest('users/show/me.json', 'GET', null, function(data) {
		if(data) {
			if(data.meta) {
				var meta = data.meta;
				if(meta.status == 'ok' && meta.code == 200) {
					userId = data.response.users[0].id;
					loadingArea.hideLoading();
					$('#content').css('visibility', 'visible');
					callback();
					return ;
				}
			}
		}
		loadingArea.hideLoading();
		errorCallback(callback);
	});
}

function showLoginDialog(callback) {
	$.ajax({
		url: 'loginDialog.html',
		dataType: 'html',
		success: function(data) {
			var loginDialog = $('<div>');
			loginDialog.html(data);
			loginDialog.dialog({
				autoOpen: false,
				height: 200,
				width: 350,
				modal: true,
				resizable: false,
				show: 'slide',
				hide: 'explode',
				title: 'Login',
				closeText: 'hide',
				dialogClass:'dialogStyle',
				buttons: {
					login: function() {
						dialogLogin(callback);
					},
					reset: function() {
						
					}
				}
			});
			loginDialog.dialog( "open" );
		}
	});
}

function dialogLogin(callback) {
	var userName = $.trim($('#userName').val());
	var passwd = $('#password').val();
	if(!userName || !passwd) {
		$('#errorMsg').show();
	} else {
		$('#errorMsg').hide();
		$('.dialogStyle').showLoading();
		
		sdk.sendRequest('users/login.json', 'POST', {login:userName, password: passwd}, function(data) {
			if(data && data.meta && data.meta.code == 200) {
				userId = data.response.users[0].id;
				callback();
				$('#content').css('visibility', 'visible');
				$('.dialogStyle').hideLoading();
				$('.dialogStyle').remove();
			} else {
				alert(data.meta.message);
				$('.dialogStyle').hideLoading();
			}
		});
	}
}

//function logoutUser() {
//	$('#container').showLoading();
//	sdk.sendRequest('users/logout.json', 'GET', null, function(data) {
//		window.location = 'login.html';
//	});
//}

function getPlaces() {
	sdk.sendRequest('places/search.json', 'GET', null, function(data) {
		if(data) {
			if(data.meta) {
				if(data.meta.code == '200' && data.meta.status == 'ok' && data.meta.method_name == 'searchPlaces') {
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
		  sdk.sendRequest('checkins/create.json', 'POST', {place_id:placeId}, function(data) {
			  if(data) {
					if(data.meta) {
						if(data.meta.code == '200' && data.meta.status == 'ok' && data.meta.method_name == 'createCheckin') {
							alert('Check in successful!');
						} else {
							alert(data.meta.message);
						}
					}
				}
			});
	  }
}