 $(function () {

 	// initialize marker info window
	info_window = new google.maps.InfoWindow();

    // get coordinates of location clicked on the map
    google.maps.event.addListener(map, 'click', function(event) {
    	var new_location = {lat: event.latLng.lat(), lng: event.latLng.lng()};
    	removeMarkers();
    	removeCircle();
    	showCircle(new_location);

    	// display # of records found within the circle
		document.getElementById("found").innerHTML = countFound(new_location);		            
	});

    // Create a <script> tag
	var script = document.createElement('script');

		// get mock data
    script.src = '../assets/js/mock_data.js';
    document.getElementsByTagName('head')[0].appendChild(script);


    // autocomplete for users current location
	var input = document.getElementById('user_location');
		autocomplete = new google.maps.places.Autocomplete(input, map_options);


    // listener for direction from user current location to selected destination
    google.maps.event.addDomListener(document.getElementById('get_direction'), 'click', showRoute);

 	// show markers in map
    window.mock_data_callback = function(results) {
    	// check if we have results
    	if(results.data.length > 0) {
    		restaurant_locations.push('<option>Select Destination</option>');
    		mock_data = results.data;

	        for (var i = 0; i < results.data.length; i++) {
        		createMarker(results.data[i]);

        		// set option content
                restaurant_locations.push(
                	'<option'
                		+ ' data-lat="' + results.data[i].geometry.coordinates.lat
                		+ '" data-lng="' + results.data[i].geometry.coordinates.lng
                		+ '">'
                		+ results.data[i].name 
                		+ ' -> ' + results.data[i].vicinity
                	+ '</option>');
	        }
	    }

	    // display # of results found
    	document.getElementById("found").innerHTML = results.data.length;

        // append restaurant options
        addDestinationOptions(restaurant_locations);
    }


	// show filter UI
	showFilterType();


    // add event for filter
    $( 'input[name="filter_restaurant"]' ).click(function() {
	  	filterRestaurants(this);
	});

});


// plots the marker in the map
function createMarker(place) {

	// get default pin image
	var pin_image = getDefaultPinImage();

    var coords = place.geometry.coordinates;
    var latLng = new google.maps.LatLng(coords.lat, coords.lng);
    var marker = new google.maps.Marker({
        map : map,
        position : latLng,
        icon: pin_image,
    });

    // check if we have a rating
    var rating = place.rating;
    if(rating == undefined) {
    	rating = '';
    }

    // format specialty
    var specialty = '';
    if(place.specialty.length > 0) {
    	specialty = place.specialty.join();
    }


    // create info window content   
    var info_window_content = '<div class="info_content">'
        + '<h3>' + place.name + '</h3>'
        + '<div>'
        	+ 	'<b>Location:</b> ' + place.vicinity
        	+ 	'<br><b>Type:</b> ' + place.type
        	+ 	'<br><b>Specialty:</b> ' + specialty
        	+ 	'<br><b>Rating:</b> ' + rating
        	+ 	'<br>'
        + '</div>' +
    '</div>';

    google.maps.event.addListener(marker, 'click', function() {
        info_window.setContent(info_window_content);
        info_window.open(map, this);
       
    });

    markers_arr.push(marker);			 
}

 // removes the marker in the map
function removeMarkers() {
	if(markers_arr.length > 0) {
    	for(var i in markers_arr) {
		   markers_arr[i].setMap(null);
		}
	}
}

// adds a circle around a selected area
function showCircle(location) {
	clearRoutes();

	cityCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: location,
        radius: radius
    });
}

// removes the existing circles
function removeCircle() {
	// initially no circle around the city is set
	// remove circle only if it is set
	if(cityCircle != undefined) {
    	cityCircle.setMap(null);
    }
}

// append restaurant locations to destination options
function addDestinationOptions(options) {
	// empty current list options
	document.getElementById('select_destination').innerHTML = '';

	// append restaurant location
	document.getElementById('select_destination').innerHTML = options;
}

// add direction from current location to destination restaurant
function showRoute() {
	// get currently selected dstination
	getDestinationLatLng();

	document.getElementById('error_container').style.display = 'none';
	document.getElementById('error_container').innerHTML = '';

	// check if we have a valid start and end points
	if(autocomplete.getPlace() == undefined) {
		document.getElementById('error_container').style.display = 'block';
		document.getElementById('error_container').innerHTML = 'Please set current location.';

		return;
	} 

	if(destination_lat == null) {
		document.getElementById('error_container').style.display = 'block';
		document.getElementById('error_container').innerHTML = 'Please select destination.';

		return;
	}


	removeCircle();
	var start = new google.maps.LatLng(autocomplete.getPlace().geometry.location.lat(), autocomplete.getPlace().geometry.location.lng());
	var end = new google.maps.LatLng(destination_lat, destination_lng);
	
	var bounds = new google.maps.LatLngBounds();
    bounds.extend(start);
    bounds.extend(end);
    map.fitBounds(bounds);
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            directionsDisplay.setMap(map);
        } else {
            document.getElementById('error_container').style.display = 'block';
    		document.getElementById('error_container').innerHTML = 'Please select destination.';

    		return false;
        }
    });

}

// Clear past routes
function clearRoutes() {
    if (directionsDisplay != null) {
        directionsDisplay.setMap(null);
    }
}

// get coordinates of selected destination
function getDestinationLatLng() {
	var select_des = document.getElementById("select_destination");
		destination_lat = select_des.options[select_des.selectedIndex].getAttribute('data-lat');
		destination_lng = select_des.options[select_des.selectedIndex].getAttribute('data-lng');
}

// get default Pin Image
function getDefaultPinImage() {
	// set default pin
	var pin_color = "fffb14";
	var pin_image = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pin_color,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34)
    );

    return pin_image;
}

// counts the number of restaurants within the circle
function countFound(location) {
	var num_found = 0;
	var _pCord, distance;
	var _kCord = new google.maps.LatLng(location.lat, location.lng);


	// loop through all mock data
	// compute distance and get only those within the radius
	for (var i = 0; i < mock_data.length; i++) {
		createMarker(mock_data[i]);
		_pCord = new google.maps.LatLng(mock_data[i].geometry.coordinates.lat, mock_data[i].geometry.coordinates.lng);

		// compute the distance
		distance = google.maps.geometry.spherical.computeDistanceBetween(_pCord, _kCord);

		if(distance <= radius) {
			num_found++;
		}
	}

	return num_found;
}

// filter restaurants
function filterRestaurants(obj) {
	removeMarkers();
	removeCircle();

	var count = 0;

	// loop through all mock data
	for (var i = 0; i < mock_data.length; i++) {
		// get only restos matching the selected type
		if(mock_data[i].type == obj.value) {
			createMarker(mock_data[i]);
			count++;
		}
	}

	// display # of results found
	document.getElementById("found").innerHTML = count;
}

// shows the options to filter restaurants
function showFilterType() {
	// set option values
	var options = '<b><label>Filter Restaurant:</label></b>';

	var types = ["Bistro", "Cafe", "Delicatessen", "Fastfood", "Pancake House", "Pizzeria", "Pub", "Sandwich Bar", "Steakhouse", "Tratorria"];
	$.each( types, function( key, value ) {

		options += '<label class="radio-inline">'
			+ '<input type="radio" name="filter_restaurant" value="'
				+ value + '"> ' + value
			+ '</label>';
	});

 	$( '#filter_restaurant_container' ).append(options);

}