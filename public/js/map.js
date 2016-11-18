google.load('visualization', '1.0', {'packages':['corechart']});

/* Initialize the map */
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

         if(getDistance(campus.lat, campus.lng) > 3000) {
            loc_lat = campus.lat;
            loc_lng = campus.lng;

            alert('Unfortunately, Google geocoding failed for this location. Here are the best parking lots centered around Geisel Library.');
         }
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
   prev_info = false;

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
   
   map.panTo(campus);
   map.setZoom(15);
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

   var predict_available = checkFuture(population_trend);
   var icon = getIcon(dist, predict_available[1]);

   createMarker(lat, lng, name, id, available, total, predict_available, population_trend, icon);
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

/* Helper function to get prediction of population within the next 30 minutes */
function checkFuture(population_trend) {
   // Get current time
   var currTime = new Date();
   var predict_index = 0;
   var predict_available = [];

   // Scale hours to include half hours
   var trend_index = currTime.getHours() * 2;

   // Treating special time cases
   if(currTime.getMinutes() >= 45) {
      trend_index += 2;
   } else if(currTime.getMinutes() >= 15) {
      trend_index++;
   }

   // Avoid index out of bounds
   trend_index--;

   // Set prediction
   if(trend_index == 47) {
      predict_available[0] = 1;
      predict_available[1] = population_trend[1];
   } else {
      predict_available[0] = trend_index + 1;
      predict_available[1] = population_trend[trend_index + 1]
   }

   return predict_available;
}

/* Function to get the icon for a lot depending on its properties */
function getIcon(dist, predict_available) {
   var icon = "";

   if(dist < 300 && predict_available >= 10) {
      icon = "public/images/blue-icon.png";
   } else if((dist < 300 && predict_available < 10 && predict_available >= 3 ) || (dist > 300 && dist < 800 && predict_available >= 10)) {
      icon = "public/images/yellow-icon.png";
   } else {
      icon = "public/images/red-icon.png";
   }

   return icon;
}

/* Create a marker with the given properties */
function createMarker(lat, lng, name, id, available, total, predict_available, population_trend, icon) {
   var percent_full = (total - available) / total * 100;
   
   var graph_data = getData(population_trend);
   var graph = infowindowGraph(graph_data);

   var contentString = '<div id="content">'+
   '<h3 id="firstHeading"><center>' + name + ' ' + id + '</center></h3>'+ 
   '<h4 id="secondHeading"><center><b>Capacity</b></center></h4>' +
   '<div class="meter"><span style="width: ' + percent_full + '%"></span></div>' + 
   '<h4 id="secondHeading"><center><b>Availability</b></center></h4>' +
   '<p><center><b>' + available + '</b> spots left</center></p>'+ 
   '<p><center>Estimate: <b>' + predict_available[1] + '</b> spots left in 30 minutes</center></p>'+ graph +
   '<div align="center"><button id="more-info"><b>View An Interactive Plot!</b></button></div>' + 
   '</div>';
   var coordinates = new google.maps.LatLng(lat, lng);
   
   var infowindow = new google.maps.InfoWindow({
      content: contentString
   });
            
   var marker = new google.maps.Marker({
      position: coordinates,
      map: map,
      icon: icon,
      animation: google.maps.Animation.DROP 
   });

   marker.addListener('click', function() {
      // Close previous info window
      if(prev_info) {
         prev_info.close();
      }

      prev_info = infowindow;
      infowindow.open(map, marker);
      
      $('#more-info').click(function() {
         interactiveGraph(graph_data, predict_available[0], name, id);
         openGraph();
      });
   });

   markers.push(marker);
}

/* Function to generate data chart for graph */
function getData(population_trend) {
   var data = new google.visualization.DataTable();
   data.addColumn('string', 'Axis');
   data.addColumn('number', 'Spots');
   data.addRows([
         ['12:00 AM', population_trend[0]],
         ['12:30 AM', population_trend[1]],
         ['1:00 AM', population_trend[2]],
         ['1:30 AM', population_trend[3]],
         ['2:00 AM', population_trend[4]],
         ['2:30 AM', population_trend[5]],
         ['3:00 AM', population_trend[6]],
         ['3:30 AM', population_trend[7]],
         ['4:00 AM', population_trend[8]],
         ['4:30 AM', population_trend[9]],
         ['5:00 AM', population_trend[10]],
         ['5:30 AM', population_trend[11]],
         ['6:00 AM', population_trend[12]],
         ['6:30 AM', population_trend[13]],
         ['7:00 AM', population_trend[14]],
         ['7:30 AM', population_trend[15]],
         ['8:00 AM', population_trend[16]],
         ['8:30 AM', population_trend[17]],
         ['9:00 AM', population_trend[18]],
         ['9:30 AM', population_trend[19]],
         ['10:00 AM', population_trend[20]],
         ['10:30 AM', population_trend[21]],
         ['11:00 AM', population_trend[22]],
         ['11:30 AM', population_trend[23]],
         ['12:00 PM', population_trend[24]],
         ['12:30 PM', population_trend[25]],
         ['1:00 PM', population_trend[26]],
         ['1:30 PM', population_trend[27]],
         ['2:00 PM', population_trend[28]],
         ['2:30 PM', population_trend[29]],
         ['3:00 PM', population_trend[30]],
         ['3:30 PM', population_trend[31]],
         ['4:00 PM', population_trend[32]],
         ['4:30 PM', population_trend[33]],
         ['5:00 PM', population_trend[34]],
         ['5:30 PM', population_trend[35]],
         ['6:00 PM', population_trend[36]],
         ['6:30 PM', population_trend[37]],
         ['7:00 PM', population_trend[38]],
         ['7:30 PM', population_trend[39]],
         ['8:00 PM', population_trend[40]],
         ['8:3O PM', population_trend[41]],
         ['9:00 PM', population_trend[42]],
         ['9:30 PM', population_trend[43]],
         ['10:00 PM', population_trend[44]],
         ['10:30 PM', population_trend[45]],
         ['11:00 PM', population_trend[46]],
         ['11:30 PM', population_trend[47]],
         ]);
   
   return data;
}

/* Create packaged graph for infowindow using data */
function infowindowGraph(data) {
   // Set chart options
   var options = {
      title: 'Trend of Open Parking Spots',
      hAxis: {
         title: 'Time of Day',
         textPosition: 'none'
      },
      width: 400,
      height: 175,
      colors: ['#26A1D6']
   };

   var node = document.createElement('div'),
       chart = new google.visualization.LineChart(node);

   chart.draw(data, options);
   return nodeToString(node)
}

/* Create interactive graph using data */
function interactiveGraph(data, predict, name, id) {
   var width = $(window).width();
   // Set chart options
   var options = {
      title: name + ' ' + id,
      hAxis: {
         title: 'Time of Day'
      },
      vAxis: {
         title: 'Open Spots'
      },
      width: width,
      height: 310,
      colors: ['#26A1D6'],
      crosshair: {
         color: '#000',
         trigger: 'selection'
      }
   };

   var node = document.getElementById('interactive-graph'),
       graph = new google.visualization.LineChart(node);
   graph.draw(data, options);
   graph.setSelection([{row: predict, column: 1}]);
}

/* Helper function to extract string from HTMLElement */
function nodeToString (node) {
   var tmpNode = document.createElement( "div" );
   tmpNode.appendChild( node.cloneNode( true ) );
   var str = tmpNode.innerHTML;
   tmpNode = node = null; // prevent memory leaks in IE
   return str;
}

/* Delete all markers on the map */
function deleteMarkers() {
   for(var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
   }
   markers = [];
}
