/* Initialize the map */
function initMap() {
   var campus = {lat: 32.8811083, lng: -117.2375732};

   // Map options
   var mapOptions = {
      zoom: 15,
      center: campus,
      styles:
   [{"featureType":"water","stylers":[{"color":"#19a0d8"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"weight":6}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#e85113"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-40}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-20}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"road.highway","elementType":"labels.icon"},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"lightness":20},{"color":"#efe9e4"}]},{"featureType":"landscape.man_made","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"hue":"#11ff00"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"hue":"#4cff00"},{"saturation":58}]},{"featureType":"poi","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#f0e4d3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-10}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"}]}]
   };

   var mapElement = document.getElementById('map');

   // Create the map
   map = new google.maps.Map(mapElement, mapOptions);
    
   // Create the search box and link it to the UI element.
   var input = document.getElementById('pac-input');
   var searchBox = new google.maps.places.SearchBox(input);

   // Bias the SearchBox results towards current map's viewport.
   map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
   });

   // Create the geocoder
   geocoder = new google.maps.Geocoder();
   
   // Initialize global variables
   markers = []; 
}

/* Geocode whatever the user input in the search box */
function geocodeAddress(address) {
   geocoder.geocode({'address':address}, function(results, status) {
      if(status === 'OK') {
         loc_lat = results[0].geometry.location.lat();
         loc_lng = results[0].geometry.location.lng();
      } else {
         alert('Geocode was not successful for the following reason: ' + status);
      }
   });
}

/* Helper function to load JSON lots file */
function loadLots(callback) {
   $.getJSON("lots.json", function(data) {
      callback(data);
   });
}

/* Find all lots of permit type */
function relevantLots(permit) {
   var total_type = "";
   var available_type = "";

   // Determine permit type
   if(permit === "A Permit") {
      total_type = "totalA";
      available_type = "availableA";
   } else if(permit === "B Permit") {
      total_type = "totalB";
      available_type = "availableB";
   } else if(permit === "S Permit") {
      total_type = "totalS";
      available_type = "availableS";
   }
   
   // Clear array containing previous lot results
   current_search = [];
   
   // Define callback for loadLots
   loadLots(function(data) {
      var lots = data.parking_lots;
      
      for(var i = 0; i < lots.length; i++) {
         // Get metrics for each valid lot
         if(lots[i][total_type] > 0) {
            getMetrics(lots, i, total_type, available_type);
         }
      }
   });
}

/* Helper function to get metrics of a given lot. Populates current_search[] */
function getMetrics(lot_list, lot, permit_total, permit_available) {
   var lat = lot_list[lot].lat;
   var lng = lot_list[lot].lng;
   var name = lot_list[lot].name;
   var id = lot_list[lot].id;
   var available = lot_list[lot][permit_available];
   var total = lot_list[lot][permit_total];
   var dist = getDistance(lat, lng);
   
   // Create lot population over time
   var population_trend = [];
   for(var i = 0; i < 48; i++) {
      population_trend[i] = Math.floor(Math.random() * total);
   }

   createMarker(lat, lng, name, id, available, total);
}

/* Helper function to get distance between parking lot and destination */
function getDistance(lat, lng) {
   var earth_rad = 6371008;
   
   var lat_diff = toRadians(loc_lat - lat);
   var lng_diff = toRadians(loc_lng - lng);

   var a = Math.sin(lat_diff / 2) * Math.sin(lat_diff / 2) +
           Math.cos(toRadians(lat)) * Math.cos(toRadians(loc_lat)) *
           Math.sin(lng_diff / 2) * Math.sin(lng_diff / 2);
   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

   return earth_rad * c;
}

/* Helper function to convert coordinates to radians */
function toRadians(coord) {
   return coord * Math.PI / 180;
}

/* Create a marker with the given properties */
function createMarker(lat, lng, name, id, available, total) {
   var percent_full = (total - available) / total * 100;
   var contentString = '<div id="content">'+
   '<div id="lotInfo">'+
   '</div>'+
   '<h1 id="firstHeading" class="firstHeading"><center>' + name + ' ' + id + '</center></h1>'+ 
   '<div id="bodyContent">'+
   '<h2><center><b>Capacity</b></center></h2>' +
   '<div class="meter"><span style="width: ' + percent_full + '%"></span></div>' + 
   '<h2><center><b>Availability</b></center></h2>' +
   '<p><center><b>' + available + '</b> spots left</center></p>'+ 
   '<p><center>Estimate: <b>12</b> spots left in 30 minutes</center></p>'+
   '<img src="images/available_spots.png" width="70%">' +
   '</div>'+
   '</div>';
   
   var coordinates = new google.maps.LatLng(lat, lng);

   var infowindow = new google.maps.InfoWindow({
      content: contentString
   });
            
   var marker = new google.maps.Marker({
      position: coordinates,
      map: map,
      animation: google.maps.Animation.DROP 
   });
   marker.addListener('click', function() {
      infowindow.open(map, marker);
   });

   markers.push(marker);
}

/* Delete all markers on the map */
function deleteMarkers() {
   for(var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
   }
   markers = [];
}
