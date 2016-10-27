function initMap() {
   var campus = {lat: 32.8811083, lng: -117.2375732};
   var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      center: campus
   });

   // Create the search box and link it to the UI element.
   var input = document.getElementById('pac-input');
   var searchBox = new google.maps.places.SearchBox(input);
   map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

   // Bias the SearchBox results towards current map's viewport.
   map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
   });
   var markers = [];
         
   var contentString = '<div id="content">'+
   '<div id="lotInfo">'+
   '</div>'+
   '<h1 id="firstHeading" class="firstHeading"><center>Hopkins Parking P701D</center></h1>'+ 
   '<div id="bodyContent"><center>'+
   '<h2><b>Capacity</b></h2>' +
   '<img src="images/capacity.png" width="25%">' +
   '<p><b>20</b> spots left </p>'+ 
   '<p> Estimate: <b>12</b> spots left in 30 minutes </p>'+
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
}
