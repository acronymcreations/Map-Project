var pins = ko.observableArray();
// var pins = []
var $body = $('body');



function initMap() {
    console.log('method ran');
    var uluru = {lat: 34.869445, lng: -111.761493};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 18,
        center: uluru
    });
    for(var i=0;i<pins.length;i++){
        var marker = new google.maps.Marker({
            position: pins[i].location,
            map: map
        });
    }
    
}

function yelp(data){
    console.log(data);
    // var rList = data.businesses
    // var lat = rList[4].location.coordinate.latitude
    // var long = rList[4].location.coordinate.longitude
    // console.log('lat: '+lat);
    // var marker = new google.maps.Marker({
    //     position: {lat: lat, lng: long},
    // });
    // marker.setMap(map);
    console.log(data.businesses.length);
    for(var i=0;i<data.businesses.length;i++){
        var lat = data.businesses[i].location.coordinate.latitude;
        var long = data.businesses[i].location.coordinate.longitude;
        var loc = {lat: lat, lng: long};
        var location = {
            location: loc
        };
        pins.push(location);
        console.log('pushed item');
    }
    console.log(pins());
    $body.append('<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDDvOpXVTSzCjsIxg96PG9txSxQoI1ObAg&callback=initMap"></script>');
}

var auth = {
    consumerKey: 'MP8vIWLoeNB-EpuQyz1sZw',
    consumerSecret: 'hHAFwe1_PPdTBjj9xfUNVcIuboQ',
    accessToken: '8e8nvvdSRuRhabjKWos6_R-lDq0vDc83',
    accessTokenSecret: 'R9do-WPnVs0Y3_SDjKW4EBDR7lc',
    serviceProvider: {
        signatureMethod: 'HMAC-SHA1'
    }
};

var searchTerm = 'food'
var near = 'sedona'

var accessor = {
    consumerSecret: auth.consumerSecret,
    tokenSecret: auth.accessTokenSecret
};

var parameters = [];
parameters.push(['term',searchTerm]);
parameters.push(['location', near]);
parameters.push(['callback', 'yelp']);
parameters.push(['oauth_consumer_key', auth.consumerKey]);
parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
parameters.push(['oauth_token', auth.accessToken]);
parameters.push(['oauth_signature_method', 'HMAC-SHA1']); 

var message = {
    'action' : 'https://api.yelp.com/v2/search',
    'method' : 'GET',
    'parameters' : parameters
};     

OAuth.setTimestampAndNonce(message);
OAuth.SignatureMethod.sign(message, accessor);

var parameterMap = OAuth.getParameterMap(message.parameters);
    
$.ajax({
    'url' : message.action,
    'data' : parameterMap,
    'dataType' : 'jsonp',
    'jsonpCallback' : 'yelp',
    'cache': true
})
.done(function(data, textStatus, jqXHR) {
    console.log('done');
})
.fail(function(jqXHR, textStatus, errorThrown) {
    console.log('error[' + errorThrown + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
});