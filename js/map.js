function initMap() {
   campus = {lat: 32.8811083, lng: -117.2375732};

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
   //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

   // Bias the SearchBox results towards current map's viewport.
   map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
   });
   markers = []; 
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
