$(document).ready(function() {
   initializePage();
});

function initializePage() {
   var firstClick = true;

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
         if(firstClick) {
            $('#map').animate({height:'530px'})
            firstClick = false;
         }

         $('html, body').animate({
            scrollTop: $("#map").offset().top
         }, 1000);

         setTimeout(function(){
            deleteMarkers();
            geocodeAddress(loc);
            relevantLots(type);
         }, 375);
      }
   });

   $('#tutorial').click(function(){
      window.location.href = '/tutorial';
   });
}

function openGraph() {
   document.getElementById("detail-graph").style.width = "100%";
}

function closeGraph() {
   document.getElementById("detail-graph").style.width = "0%";
}
