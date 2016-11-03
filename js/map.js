function initMap() {
   campus = {lat: 32.8811083, lng: -117.2375732};

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
   map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

   // Bias the SearchBox results towards current map's viewport.
   map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
   });

   // Create the geocoder
   geocoder = new google.maps.Geocoder();

   markers = []; 
}

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

function loadLots(callback) {
   $.getJSON("lots.json", function(data) {
      callback(data);
   });
}

function relevantLots(permit) {
   var total_type = "";

   if(permit === "A Permit") {
      total_type = "totalA";
   } else if(permit === "B Permit") {
      total_type = "totalB";
   } else if(permit === "S Permit") {
      total_type = "totalS";
   }
   
   loadLots(function(data) {
      var lots = data.parking_lots;
      
      for(var i = 0; i < lots.length; i++) {
         if(lots[i][total_type] > 0) {
            getMetrics(lots, i);
         }
      }
   });
}

function getMetrics(lot_list, lot) {
   console.log(lot_list[lot].name);
}

function createMarker() {
   var contentString = '<div id="content">'+
   '<div id="lotInfo">'+
   '</div>'+
   '<h1 id="firstHeading" class="firstHeading"><center>Hopkins Parking P701D</center></h1>'+ 
   '<div id="bodyContent"><center>'+
   '<h3><b>Capacity</b></h3>' +
   '<img src="images/capacity.png" width="25%">' +
   '<p><b>20</b> spots left </p>'+ 
   '<p> Estimate: <b>12</b> spots left in 30 minutes </p>'+
   '<h3><b>Availability</b></h3>' +
   '<img src="images/available_spots.png" width="70%">' +
   '</center></div>'+
   '</div>';
            
   var infowindow = new google.maps.InfoWindow({
      content: contentString
   });
            
   var marker = new google.maps.Marker({
      position: campus,
      map: map,
      animation: google.maps.Animation.DROP 
   });
   marker.addListener('click', function() {
      infowindow.open(map, marker);
   });

   markers.push(marker);
}

function deleteMarkers() {
   for(var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
   }
   markers = [];
}
