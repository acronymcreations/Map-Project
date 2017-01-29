// Global variables
var vm;
var pins = [];
var searchTerm = 'food';
var infoWindow;
var map;
var errorMessage = '';

// View Model section
function ViewModel(){
	var self = this;
    // creates the ko array that holds all of the data pins
	self.kopins = ko.observableArray(pins);

    // observable that monitors filtering of data
	self.placeName = ko.observable(' ');

    // observable that handles error messages
    self.errorMessage = ko.observable(errorMessage);

    // Monitors for clicks on the list items in the menu
	self.listClick = function(location){
		console.log(location);
		google.maps.event.trigger(location.marker,'click');
	}

    // Handles filtering the data whenever 'placeNames' value changes
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

// Object that holds all data required for one pin in the map.
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

// Function that puts everything on the map together
function initMap() {
    // Sets the focus of the map
    var sedonaLoaction = {lat: 34.867445, lng: -111.781493};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: sedonaLoaction
    });

    // creates the info window that pops up when a marker is clicked on
    infoWindow = new google.maps.InfoWindow({
    	maxWidth: 180
    });

    // for loop that builds all of the pins that will go on the map
    for(var i=0;i<pins.length;i++){
        var lati = pins[i].lat;
        var longi = pins[i].long;
        var pinLocation = {lat: lati, lng: longi};
        // creates the marker (pin)
        var marker = new google.maps.Marker({
            position: pinLocation,
            map: map,
            title: pins[i].name,
            optimized: false,
            animation: google.maps.Animation.DROP,
            content: infoWindowString(pins[i]),
            visible: true
        });
        
        // Adds a click listener to each pin that opens the info window and animates the pin
        marker.addListener('click',function(){
            var self = this;
            // opens the info window
            infoWindow.setContent(self.content);
            infoWindow.open(map, self);
            // animates the pin with bouncing affect
            self.setAnimation(google.maps.Animation.BOUNCE);
            // stops the bouncing after 2 seconds
            setTimeout(function() {
                self.setAnimation(null);
            }, 2000);
        });

        // adds the marker created above to the rest of the pin data
        pins[i].marker = marker;
        
    }

    // creates a new view model and applies the ko bindings
    vm = new ViewModel();
    ko.applyBindings(vm);    
    
}

// function that builds the html displayed in the info window
function infoWindowString(pin){
    var html = '<div class="info-window"';
    html += '<img src='+pin.image+' width="30">';
    html += '<a href='+pin.url+' target="_blank"><strong>'+pin.name+'</strong></a><br>';
    html += '<img src='+pin.rating_img+'><br>';
    html += pin.snip;
    html += '<br>';
    html += '<a href='+pin.url+' target="_blank">';
    html += '<img src="img/yelp-logo.png" width=40></a>';
    html += '</div'
 
    return html;
}

// Yelp API Call
function initYelp(){
    // yelp keys for authentication.  Should probably be kept private in production app.
    var auth = {
        consumerKey: 'MP8vIWLoeNB-EpuQyz1sZw',
        consumerSecret: 'hHAFwe1_PPdTBjj9xfUNVcIuboQ',
        accessToken: '8e8nvvdSRuRhabjKWos6_R-lDq0vDc83',
        accessTokenSecret: 'R9do-WPnVs0Y3_SDjKW4EBDR7lc',
        serviceProvider: {
            signatureMethod: 'HMAC-SHA1'
        }
    };
    var accessor = {
        consumerSecret: auth.consumerSecret,
        tokenSecret: auth.accessTokenSecret
    };

    // search location
    var near = 'sedona';

    // paeameters that are sent to yelp for proper ajax call
    var parameters = [];
    parameters.push(['term',searchTerm]);
    parameters.push(['location', near]);
    parameters.push(['callback', 'yelpCallBack']);
    parameters.push(['oauth_consumer_key', auth.consumerKey]);
    parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
    parameters.push(['oauth_token', auth.accessToken]);
    parameters.push(['oauth_signature_method', 'HMAC-SHA1']); 

    // actual mesage that is sent to yelp, using the above info
    var message = {
        'action' : 'https://api.yelp.com/v2/search',
        'method' : 'GET',
        'parameters' : parameters
    };     

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var parameterMap = OAuth.getParameterMap(message.parameters);
        
    // Actual ajax call
    $.ajax({
        'url' : message.action,
        'data' : parameterMap,
        'dataType' : 'jsonp',
        'jsonpCallback' : 'yelpCallBack',
        'cache': true
    })
    // On complete method
    .done(function(data, textStatus, jqXHR) {
        // Clears out any leftover data from pins array
        pins = [];
        // for loop that parses data from yelp into the pins array
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
        // calls the map method that places all the pins on the map
        initMap();
    })
    // if the yelp request fails, an error message is displayed
    // in the top right of screen and then the map is loaded
    .fail(function(jqXHR, textStatus, errorThrown) {
        errorMessage = 'Yelp data failed to load.  Please try again later.'
        initMap();
    });
}

// Required callback method called when yelp api finishes
function yelpCallBack(data){
    console.log(data);
}

// Opens the slideout menu
function openMenu() {
    document.getElementById("side-menu").style.width = "250px";
}

// closes the slideout menu
function closeMenu() {
    document.getElementById("side-menu").style.width = "0";
}

// function newSearch(){
//     console.log('button clicked');
//     searchTerm = document.getElementById('searchTerm').value;
//     console.log(searchTerm);
//     initYelp(searchTerm);
// }

















