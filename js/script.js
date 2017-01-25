
var pins = ko.observableArray();

var placeName = ko.observable("Bert");



function pin(name,lat,long){
    var self = this;
    self.name = name;
    self.lat = lat;
    self.long = long;
}

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

function yelpCallBack(data){
    console.log(data);
    for(var i=0;i<data.businesses.length;i++){
        var name = data.businesses[i].name;
        var lat = data.businesses[i].location.coordinate.latitude;
        var long = data.businesses[i].location.coordinate.longitude;
        console.log(new pin(name,lat,long));
        pins.push(new pin(name,lat,long));
    }
    console.log('here are the pins');
    console.log(pins());
    
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
parameters.push(['callback', 'yelpCallBack']);
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
    'jsonpCallback' : 'yelpCallBack',
    'cache': true
})
.done(function(data, textStatus, jqXHR) {
    console.log('done');
})
.fail(function(jqXHR, textStatus, errorThrown) {
    console.log('error[' + errorThrown + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
});


ko.applyBindings();