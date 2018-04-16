var map;
var places = [
  {title: 'Chikara', location: {lat: 37.351927, lng: -121.995408}, id: 0},
  {title: 'Meet Fresh', location: {lat: 37.324457, lng: -122.0111853}, id: 1},
  {title: 'Leichi', location: {lat: 37.329574, lng: -121.966893}, id: 2},
  {title: 'Salon Exclussif', location: {lat: 37.2607179, lng: -121.9324234}, id: 3},
  {title: 'Pekoe', location: {lat: 37.3146179, lng: -121.7901318}, id: 4},
  {title: 'Santa Clara Central Park', location: {lat: 37.3417257, lng: -121.9751511}, id: 5},
  {title: 'Fremont Older Open Space Preserve', location: {lat: 37.284496, lng: -122.063859}, id: 6},
  {title: 'Big Basin Redwoods State Park', location: {lat: 37.1736949, lng: -122.246402}, id: 7},
];
var markerDict = {};
const FOURSQURE_CLIENT_ID = 'IBP4ZKGAUKFK1FICEU3JJ2IFOLXJ5PVZ1M5SXEBCZVRKTLF0';
const FOURSQURE_CLIENT_SECRECT = 'T53ZUJIRGWLARY3GYROWJVXSV2MDEWRIGCFCQ0BCTPVNC0KB';

function googleMapError() {
  document.getElementById('map').innerHTML = 'Fail to load Google Maps.';
}

// Initial and display map, add map event handler
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.3408459, lng: -122.0048675},
    zoom: 13,
    mapTypeControl: false,
  });

  google.maps.event.addDomListener(window, 'resize', () => {
    google.maps.event.trigger(map, "resize");
    map.fitBounds(bounds);
  });

  var largeInfowindow = new google.maps.InfoWindow();
  var defaultIcon = makeMarkerIcon('fc766d', 1);
  var highlightedIcon = makeMarkerIcon('e7453c', 1.15);

  // Create a hashtable of markers on initialize.
  for (var i = 0; i < places.length; i++) {
    var position = places[i].location;
    var title = places[i].title;
    var id = places[i].id;
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: id,
      icon: defaultIcon,
    });
    markerDict[id] = marker;

    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });

    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }

  initShowMarkers();
}

function makeMarkerIcon(markerColor, scale) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21 * scale, 34 * scale),
    new google.maps.Point(0, 0),
    new google.maps.Point(10 * scale, 34 * scale),
    new google.maps.Size(21 * scale, 34 * scale));
  return markerImage;
}

// Populates the infowindow when the marker is clicked. Only allow one infowindow
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;

    // Make marker property cleared when the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });

    infowindow.setContent('<div><h3>' + marker.title + '</h3></div>' +
      '<div id="fs-info"><p class="icon"><i class="fa fa-spinner fa-spin"></i><br><br></p>' +
      'Waiting from Foursquare...</div>');

    var url = 'https://api.foursquare.com/v2/venues/explore?client_id=' +
      FOURSQURE_CLIENT_ID + '&client_secret=' + FOURSQURE_CLIENT_SECRECT +
      `&ll=${marker.position.lat()},${marker.position.lng()}&query=${marker.title}&v=20180323`;
    fetch(url)
      .then(res => {return res.json()})
      .then(data => {
        var text = '';
        if (data.hasOwnProperty('meta')) {
          if(data.meta.code == 200) {
            if(data.response.hasOwnProperty('totalResults')) {
              if(data.response.totalResults == 0) {
                text = 'No results from Foursquare'
              } else {
                var venue = data.response.groups[0].items[0].venue;

                if(venue.hasOwnProperty('contact') &&
                  venue.contact.hasOwnProperty('phone'))
                  text = `<p><i class="fa fa-phone"></i>  ${venue.contact.phone}</p>`;

                if(venue.hasOwnProperty('location') &&
                  venue.location.hasOwnProperty('formattedAddress'))
                  formattedAddress = venue.location.formattedAddress;
                  text += `<p><i class="fa fa-map-marker"></i>  ${formattedAddress.join(', ')}</p>`;

                if(venue.hasOwnProperty('categories') &&
                  venue.categories[0].hasOwnProperty('name'))
                  text += `<p><i class="fa fa-tag"></i>  ${venue.categories[0].name}</p>`;
                text += '<p>(Info from Foursquare)</p>'
              }
            }
          } else {
            text = 'Error happens when requesting from Foursquare';
          }
        } else {
          text = 'Bad response from Foursquare';
        }
        document.getElementById('fs-info').innerHTML = text;
      });

    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
  }
}

// Show the markers when page first loaded
function initShowMarkers() {
  bounds = new google.maps.LatLngBounds();
  for (var id in markerDict) {
    markerDict[id].setMap(map);
    bounds.extend(markerDict[id].position);
  }
  map.fitBounds(bounds);
}

function showFilteredMarkers(idSet) {
  for (var id in markerDict) {
    if (idSet.has(parseInt(id))) {
      markerDict[id].setMap(map);
    } else {
      markerDict[id].setMap(null);
    }
  }
}

function animateMarker(i) {
  const id = i.toString();
  if (id in markerDict) {
    const marker = markerDict[id];
    if (!marker.animating) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){
        marker.setAnimation(null);
      }, 700);
    }
  }
}

var viewModel = function() {
  var self = this;

  // Handle filter list
  self.places = ko.observableArray(places);
  self.filterQuery = ko.observable('');
  self.filteredPlaces = ko.computed(function() {
    if (!self.filterQuery) {
      return self.places;
    } else {
      var filterPlacesArr = places.filter(place => {
        return place.title.toLowerCase().indexOf(self.filterQuery().toLowerCase()) > -1;
      });
      showFilteredMarkers(new Set(filterPlacesArr.map(a => a.id)));
      return filterPlacesArr;
    }
  });

  // Handle list item click
  self.placeItemClickHandler = function(place) {
    animateMarker(place.id);
    google.maps.event.trigger(markerDict[place.id], 'click');
  };

  // Handle hamburger icon and visibility of left-box
  self.leftBoxVisible = ko.observable(true);
  self.rotateDeg = ko.observable('rotate-90');
  self.toggle = () => {
    self.leftBoxVisible(!self.leftBoxVisible());
  };
};

ko.applyBindings(new viewModel());
