var vm;

var pins = [];

var searchTerm = 'food';

var infoWindow;

var map;

function ViewModel(){
    console.log('vm created');
	var self = this;
	self.kopins = ko.observableArray(pins);

	self.placeName = ko.observable(' ');

	self.listClick = function(location){
		console.log(location);
		google.maps.event.trigger(location.marker,'click');
	}

	self.filter = ko.computed(function(){
		for (var i = 0; i < self.kopins().length; i++) {
			if(self.kopins()[i].name.toLowerCase().includes(self.placeName().toLowerCase()) 
				|| self.kopins()[i].snip.toLowerCase().includes(self.placeName().toLowerCase())){
				self.kopins()[i].isVisible(true);
				self.kopins()[i].marker.visible = true;
                self.kopins()[i].marker.setMap(map);
			}else{
				self.kopins()[i].isVisible(false);
				self.kopins()[i].marker.visible = false;
                self.kopins()[i].marker.setMap(null);
			}
		}
	},this);
}

function pin(name,lat,long,image,url,rating_img,snip){
    var self = this;
    self.name = name;
    self.lat = lat;
    self.long = long;
    self.image = image;
    self.url = url;
    self.rating_img = rating_img;
    self.snip = snip;
    self.isVisible = ko.observable();
}

function initMap() {
    var sedonaLoaction = {lat: 34.867445, lng: -111.781493};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: sedonaLoaction
    });
    console.log(pins.length);

    infoWindow = new google.maps.InfoWindow({
    	maxWidth: 140
    });
    for(var i=0;i<pins.length;i++){
        var lati = pins[i].lat;
        var longi = pins[i].long;
        var pinLocation = {lat: lati, lng: longi};
        var marker = new google.maps.Marker({
            position: pinLocation,
            map: map,
            title: pins[i].name,
            optimized: false,
            animation: google.maps.Animation.DROP,
            content: infoWindowString(pins[i]),
            visible: true
        });
        
        marker.addListener('click',function(){
            var self = this;
            infoWindow.setContent(self.content);
            infoWindow.open(map, self);
            self.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                self.setAnimation(null);
            }, 2000);
        });
        pins[i].marker = marker;
        
    }
    vm = new ViewModel();
    ko.applyBindings(vm);    
    
}

function infoWindowString(pin){
    var html = '<img src='+pin.image+' width="30">';
    html += '<a href='+pin.url+' target="_blank"><strong>'+pin.name+'</strong></a><br>';
    html += '<img src='+pin.rating_img+'><br>';
    html += pin.snip;
    html += '<br>';
    html += '<a href='+pin.url+' target="_blank">';
    html += '<img src="img/yelp-logo.png" width=40></a>';
 
    return html;
}

function yelpCallBack(data){
    console.log(data);
}

function initYelp(){
    var auth = {
        consumerKey: 'MP8vIWLoeNB-EpuQyz1sZw',
        consumerSecret: 'hHAFwe1_PPdTBjj9xfUNVcIuboQ',
        accessToken: '8e8nvvdSRuRhabjKWos6_R-lDq0vDc83',
        accessTokenSecret: 'R9do-WPnVs0Y3_SDjKW4EBDR7lc',
        serviceProvider: {
            signatureMethod: 'HMAC-SHA1'
        }
    };

    var near = 'sedona';

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
        pins = [];
        for(var i=0;i<data.businesses.length;i++){
            var item = data.businesses[i];
            var name = item.name;
            var lat = item.location.coordinate.latitude;
            var long = item.location.coordinate.longitude;
            var image = item.image_url;
            var url = item.mobile_url;
            var rating_img = item.rating_img_url;
            var snip = item.snippet_text;
            pins.push(new pin(name,lat,long,image,url,rating_img,snip));
        }
        initMap();
        console.log('done');
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        console.log('error[' + errorThrown + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
    });
}

function newSearch(){
    console.log('button clicked');
    searchTerm = document.getElementById('searchTerm').value;
    console.log(searchTerm);
    initYelp(searchTerm);
}


















