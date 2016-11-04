$(document).ready(function() {
   initializePage();
});

function initializePage() {
   $('#find-park').click(function(){
      var menu = document.getElementById('permit-select');
      var type = menu.value;
      var search = document.getElementById('pac-input');
      var loc = search.value;

      if(type == "" && loc == "") {
         alert("Please select a destination and your permit type");
      } else if(type == "") {
         alert("Please select your permit type");
      } else if(loc == "") {
         alert("Please select your destination on campus");
      } else {
         //TODO reorganize
         deleteMarkers();
         geocodeAddress(loc);
         relevantLots(type);
      }
   });
}
