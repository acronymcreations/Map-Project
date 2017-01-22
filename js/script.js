console.log('hello');

function initMap() {
        var uluru = {lat: 34.869445, lng: -111.761493};
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 18,
          center: uluru
        });
        var marker = new google.maps.Marker({
          position: uluru,
          map: map
        });
      }

    //   <script async defer
    // src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDDvOpXVTSzCjsIxg96PG9txSxQoI1ObAg&callback=initMap">
    // </script>