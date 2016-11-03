/* Initialize the map */
function initMap() {
   var campus = {lat: 32.8811083, lng: -117.2375732};

   // Map options
   var mapOptions = {
      zoom: 15,
      center: campus,
      styles:
      [{"featureType":"all","elementType":"labels.text.fill",
      "stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},
      {"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill",
      "stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke",
      "stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},
      {"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},
      {"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},
      {"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},
      {"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},
      {"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},
      {"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},
      {"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},
      {"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all",
      "stylers":[{"color":"#021019"}]}]
   };

   var mapElement = document.getElementById('map');

   // Create the map
   map = new google.maps.Map(mapElement, mapOptions);
    
   // Create the search box and link it to the UI element.
   var input = document.getElementById('pac-input');
   var searchBox = new google.maps.places.SearchBox(input);
   //TODO remove this line to unlink search box from map
   map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

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
   var total = lot_list[lot][permit_total];
   var available = lot_list[lot][permit_available];
   
   createMarker(lat, lng, name, id, available, total);
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
