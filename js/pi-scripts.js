
var $ = jQuery.noConflict();






function closePopUp(e) {
  const className = `.hotel-${e}`;
  document.querySelector(className).classList.remove('highlight');
  console.log('className: ', `document.querySelector(${className}).classList.remove('highlight');`);  
}




$(function () {
  /** Map Initialize  **/

  let map;
  var markers = []; // Array to store markers


function centerToDefault(){
  // Specify the coordinates where you want the map to be centered
  var centerCoordinates =  { lat: 29.76035220031458, lng: -95.3665050615942};
  $('#pi-address').attr('data-coordinates', '29.76035220031458' + ',' + -95.3665050615942);

  centerMapOnCoordinates(centerCoordinates.lat, centerCoordinates.lng, 0);
}

function location_not_found(){
  const $content = $('<div>').addClass('pi-not-found hide');

  $content.append($(`
    <a href="#" class="close">
      <i class="fa-solid fa-xmark"></i>
    </a>         
    <p>
      No properties were found near your location. Please search for another address or see the list below for other great Palace Inn properties.
    </p>
  `));

  const $closeIcon = $content.find('.close'); // Replace with your selector
  $closeIcon.on('click touchend', function(e){
    e.preventDefault();
    $content.addClass('hide');
    return false;
  });
  

  return $content;

  
}

  function toggleHighlight(markerView, property) {
    $('.property').removeClass('highlight');
    if (markerView.content.classList.contains("highlight")) {
      markerView.content.classList.remove("highlight");
      markerView.zIndex = null;
    } else {
      markerView.content.classList.add("highlight");
      markerView.zIndex = 1;
    }
  }

  function buildContent(property, markerView) {
    const content = document.createElement("div");
  
    content.classList.add('property');
    content.classList.add('hotel-' + property.ID);
    content.innerHTML = `
      <div class="icon">        
          <img src="${property.map_pin}">
          <span>${property.order}</span>
      </div>
      <div class="content">
        <a href="#" class="pi-pop-close"><i class="fa-solid fa-xmark"></i></a>
        <h3><a class="title" href="${property.link}">Palace Inn ${property.title}</a></h3>
        <div class="featured-image">
          <img src="${property.image}" alt="${property.title}}" width="" max-height="200px"/>
        </div>
        <div class="contacts">
          <div class="contact">
            <p class="address"><strong>Address:</strong> ${property.address}</p>   
            <p class="phone"><a href="tel:+${property.phone}"><strong>Phone:</strong> ${property.phone}</a></p>   
          </div>
          <div class="cta ${property.color}">
            <a class="more-info" href="${property.link}">More Info</a>
            <a class="book-now" href="${property.booking_url}" target="_blank">Book Now</a>
          </div>
        </div>
      </div>
      `;


    const closeIcon = content.querySelector(".pi-pop-close"); // Replace with your selector
    ['click', 'touchend'].forEach(function(eventType) {
      if (closeIcon) {
        closeIcon.addEventListener(eventType, (event) => {
          event.stopPropagation(); // Prevent event bubbling to marker click listener
          document.querySelector('.hotel-' +  property.ID).classList.remove('highlight');
          // console.log(markerView);
          markerView.zIndex = null;
        });
      } 
    }); 

    ['click', 'touchend'].forEach(function(eventType) {
      content.querySelector('.phone').addEventListener(eventType, (event) => {
        const href = event.target.getAttribute('href');
        window.location.href = href;      
        return true;
      });
    });

    ['click', 'touchend'].forEach(function(eventType) {
      content.querySelector('.book-now').addEventListener(eventType, (event) => {
        const href = event.target.getAttribute('href');
        window.open(href, '_blank');
        return true;
      });
    });

    ['click', 'touchend'].forEach(function(eventType) {
      content.querySelector('.more-info').addEventListener(eventType, (event) => {
        const href = event.target.getAttribute('href');
        window.location.href = href;      
        return true;
      });
    });

    ['click', 'touchend'].forEach(function(eventType) {
      content.querySelector('.title').addEventListener(eventType, (event) => {
        const href = event.target.getAttribute('href');
        window.location.href = href;      
        return true;
      });
    });

    return content;
  }
  
  function centerMapOnCoordinates(lat, lng, verticalOffset = 0) {
    // Adjust the latitude by adding the vertical offset
    const adjustedLat = lat - verticalOffset;
    const userLocation = new google.maps.LatLng(adjustedLat, lng); // Create a LatLng object
    map.setCenter(userLocation); // Set the map center to the user's coordinates
  }

  function getZoomLevelForRadius(map, radiusInMiles) {
    // Conversion factor from miles to meters
    const metersPerMile = 1609.34;
  
    // Calculate radius in meters
    const radiusInMeters = radiusInMiles * metersPerMile;
  
    // Reference for Google Maps zoom level -> meters per pixel relationship (replace with your actual source)
    const zoomLevelPixelRelationship = {
      // Example values, you might need to adjust these based on your map tiles
      20: 0.000015625,
      19: 0.00003125,
      18: 0.0000625,
      17: 0.000125,
      16: 0.00025,
      // ... add more zoom levels and their corresponding meters per pixel values
    };
  
    // Find the closest zoom level where meters per pixel is less than or equal to radius in meters
    let closestZoomLevel;
    for (const zoomLevel in zoomLevelPixelRelationship) {
      const metersPerPixel = zoomLevelPixelRelationship[zoomLevel];
      if (metersPerPixel <= radiusInMeters) {
        closestZoomLevel = parseInt(zoomLevel);
        break;
      }
    }
  
    // Ensure a valid zoom level is found
    if (!closestZoomLevel) {
      console.warn("Zoom level not found for radius", radiusInMiles, "miles");
      return null;
    }
  
    // Set the map zoom level
    map.setZoom(closestZoomLevel);
  
    return closestZoomLevel;
  }


  function clearMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers = [];
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.",
    );
    // infoWindow.open(map);

    // $('.pi-not-found').removeClass('hide');
  }

  
  async function updateGoogleMapPins(hotels, initialize = false){   


    var bounds = new google.maps.LatLngBounds();

    clearMarkers(markers);

    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    
    $.each(hotels, function(index, hotel) {
  
      const pin = new PinElement({
        glyph: `${hotel.order}`,
      });

     var coordinates = hotel.coordinates.split(",").map(function (coord) {
       return parseFloat(coord.trim());
     });

     let marker = new AdvancedMarkerElement({
        position: { lat: coordinates[0], lng: coordinates[1] },
        map: map,
        title: hotel.title
      });

      marker.content = buildContent(hotel, marker)

      marker.addListener('click', ({ domEvent, latLng }) => {
        // centerMapOnCoordinates(latLng.lat(), latLng.lng())    
        var mapContainer = map.getDiv();         
        toggleHighlight(marker, hotel);
        map.panTo(latLng); // Center the map around the clicked marker with an offset
        map.panBy(0, mapContainer.offsetHeight * -0.325);            
      });

       // Add marker to bounds
       bounds.extend(marker.position);
       markers.push(marker);
    });

    if (initialize){
      map.fitBounds(bounds);
    }
  }


  async function initGoogleMap(){

    // Request needed libraries.
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    
  
    // Specify the coordinates where you want the map to be centered
    var centerCoordinates =  { lat: 29.76035220031458, lng: -95.3665050615942};
    // var centerCoordinates = { lat: 40.7128, lng: -74.0060 }; // New York City coordinates
  
    var hotels = PI_DATA.mapCoordinates;
  
    // Create a map object and specify the DOM element for display.
    map = new Map(document.getElementById('pi-map2'), {
        center: centerCoordinates,
        zoom: 12, // You can adjust the zoom level as needed
        mapId: '4504f8b37365c3d0',
    });
  
    $('#pi-address').attr('data-coordinates', '29.76035220031458' + ',' + -95.3665050615942);
    // Create an info window to share between markers.
    var infoWindow = new InfoWindow();

    infoWindow = new google.maps.InfoWindow();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          $('#pi-address').attr('data-coordinates', position.coords.latitude + ',' + position.coords.longitude);
          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          // infoWindow.open(map);
          map.setCenter(pos);
        },
        () => {          
          handleLocationError(true, infoWindow, map.getCenter());
        },
      );
    } else {
      
      // handleLocationError(true, infoWindow, map.getCenter());
    }
    
 
    $('#pi-map2').append(location_not_found());
    // Create a new bounds object outside the loop
    var bounds = new google.maps.LatLngBounds();
 
    // Loop through the locations array to create map pins
    $.each(hotels, function(index, hotel) {
        const pin = new PinElement({
          glyph: `${hotel.order}`,
        });
  
       var coordinates = hotel.coordinates.split(",").map(function (coord) {
         return parseFloat(coord.trim());
       });
  
       
  
        let marker = new AdvancedMarkerElement({
            position: { lat: coordinates[0], lng: coordinates[1] },
            map: map,            
            title: hotel.title            
        });

        marker.content = buildContent(hotel, marker);
  
        marker.addListener('click', ({ domEvent, latLng }) => {          
          // centerMapOnCoordinates(latLng.lat(), latLng.lng()) 
          var mapContainer = map.getDiv();         
          toggleHighlight(marker, hotel);
          map.panTo(latLng); // Center the map around the clicked marker with an offset
          map.panBy(0, mapContainer.offsetHeight * -0.325);
        });
        

        // Add marker to bounds
        bounds.extend(marker.position);
        markers.push(marker);
    });

    map.fitBounds(bounds);
   
  }

  function parse_area_booking_data($container) {
    const code = $container.find(".value").data("value");
    const checkin = $container.find(".pi-checkin").val(); // Set your actual checkin value
    const checkout = $container.find(".pi-checkout").val(); // Set your actual checkout value

    return buildQueryString({ code, checkin, checkout });
  }

  function buildQueryString(params) {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  }

  function validateField($container) {
    const checkin = $container.find(".pi-checkin");
    const checkout = $container.find(".pi-checkout");

    // Remove previous error classes
    $container.find("label").removeClass("error");

    // Parse date strings to timestamps
    const checkinTimestamp = Date.parse(checkin.val());
    const checkoutTimestamp = Date.parse(checkout.val());

    // Check if timestamps are valid and if checkout date is greater than checkin date
    if (
      !isNaN(checkinTimestamp) &&
      !isNaN(checkoutTimestamp) &&
      checkoutTimestamp <= checkinTimestamp
    ) {
      checkin.siblings("label").addClass("error");
      checkout.siblings("label").addClass("error");
    }

    // Return true if there are no errors, otherwise false
    return $container.find("label.error").length === 0;
  }
 
  function initializeMap(hotels) {
    // Loop through the hotels array and add markers with popups to the map
    var bounds = new L.LatLngBounds();

    hotels.forEach(function (hotel) {
      var coordinates = hotel.coordinates.split(",").map(function (coord) {
        return parseFloat(coord.trim());
      });

      // Define custom icon
      // var customIcon = L.icon({
      //   iconUrl: hotel.map_pin, // Specify the URL of your custom icon
      //   iconSize: [37, 56], // Size of the icon
      //   iconAnchor: [16, 32], // Anchor point of the icon, center bottom
      //   popupAnchor: [0, -32] // Popup anchor relative to the icon
      // });

      // Define custom icon with background image
      var customIcon = L.divIcon({
        className: "custom-icon",
        html:
          '<div class="pin-icon" style="background-image:url(' +
          hotel.map_pin +
          ')">' +
          hotel.order +
          "</div>",
        iconSize: [37, 56], // Size of the icon
        iconAnchor: [16, 32], // Anchor point of the icon, center bottom
        popupAnchor: [0, -32], // Popup anchor relative to the icon
      });
      var marker = L.marker(coordinates, { icon: customIcon }).addTo(map);

      var popupContent =
        '<div clas="pi-popup">' +
        "<h3>Palace Inn " +
        hotel.title +
        "</h3>" +
        '<img src="' +
        hotel.image +
        '" alt="' +
        hotel.title +
        '" style="max-height: 200px;">' +
        '<div class="pi-popup-contacts ' +
        hotel.color +
        '">' +
        '<div class="pi-popup-item"><p>' +
        hotel.address +
        "</p>" +
        "<p><strong>Phone:</strong> " +
        hotel.phone +
        '</p></div><div class="pi-popup-item">' +
        '<a class="cta" href="' +
        hotel.link +
        '" >More Info</a><a class="cta" href="' +
        hotel.booking_url +
        '" target="_blank">Book Now</a>' +
        "</div></div>" +
        "</div>";

      marker.bindPopup(popupContent);
      marker.on("click", function (e) {
        const latlng = e.latlng;
        const offsetPixels = [0, -150]; // Offset the center by adjusting pixel coordinates
        const offsetLatlng = map.layerPointToLatLng(
          map.latLngToLayerPoint(latlng).add(offsetPixels)
        );
        map.panTo(offsetLatlng); // Center the map around the clicked marker with an offset
        console.log("offset: ", offsetLatlng);
      });

      // Extend the bounds to include this marker's position
      bounds.extend(marker.getLatLng());
    });

    // Fit the map to the bounds
    map.fitBounds(bounds);
  }

  function calculateZoomLevel(mapParams, latLng, radiusMiles) {
    // Check if mapParams is defined and is an object
    console.log("payload:", latLng, radiusMiles);
    if (!mapParams || typeof mapParams !== "object") {
      console.error("Map object is not defined or invalid");
      return;
    }

    // Check if latLng is a valid array with two elements
    if (!Array.isArray(latLng) || latLng.length !== 2) {
      console.error("Invalid latLng parameter:", latLng);
      return;
    }

    // Destructure latitude and longitude from latLng array
    const [latitude, longitude] = latLng;

    // Check if latitude and longitude values are valid numbers
    // Check if latitude and longitude values are valid numbers
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      console.error("Invalid latitude or longitude values:", latLng);
      return;
    }

    console.log("Latitude:", latitude, "Longitude:", longitude);

    // Convert miles to meters (1 mile is approximately 1609.34 meters)
    const radiusMeters = radiusMiles * 1609.34;

    // Create a LatLng object
    const latLngObject = L.latLng(latitude, longitude);

    console.log("LatLng Object:", latLngObject);

    try {
      // Calculate the zoom level based on the bounds
      const zoomLevel = mapParams.getBoundsZoom(
        latLngObject.toBounds(radiusMeters)
      );
      console.log("zoom level: ", zoomLevel);

      return zoomLevel;
    } catch (error) {
      console.error("Error calculating zoom level:", error);
    }
  }


  function clearMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  }

  function getLatLngBounds(distanceInMeters) {
    var center = map.getCenter();
    var radius = distanceInMeters / 2; // Half the distance for each direction

    // Create LatLngBounds object representing the desired area
    var bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(center.lat() - radius / 111132, center.lng() - radius / (111132 * Math.cos(center.lat() * Math.PI / 180))),
      new google.maps.LatLng(center.lat() + radius / 111132, center.lng() + radius / (111132 * Math.cos(center.lat() * Math.PI / 180)))
    );

    return bounds;
  }

  function setZoomToBounds(bounds) {
    var minZoom = 2; // Set your desired minimum zoom level (adjust as needed)
    map.fitBounds(bounds, {
      padding: 20, // Add some padding for aesthetics (optional)
      maxZoom: map.getZoom(), // Prevent zoom beyond current level
      minZoom: minZoom
    });
  }

  if ($("#pi-map").length) {
    // const initialCoordinates = [29.76035220031458, -95.3665050615942];

    // var map = L.map("pi-map").setView(initialCoordinates, 13);
    // // Add Google Maps as a tile layer
    // L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    //   maxZoom: 17,
    //   subdomains: ["mt0", "mt1", "mt2", "mt3"],
    //   attributionControl: false, // Disable the default attribution control
    // }).addTo(map);

    // map.scrollWheelZoom.disable();

    // map.attributionControl.remove();

    // $("#pi-map").on("wheel", function (e) {
    //   if (!e.ctrlKey) {
    //     map.scrollWheelZoom.disable();
    //     $(".pi-map-overlay").removeClass("hide");
    //   } else {
    //     map.scrollWheelZoom.enable();
    //     $(".pi-map-overlay").addClass("hide");
    //   }
    // });

    // $("#pi-map").on("touchstart", function (e) {
    //   if (e.originalEvent.touches.length > 1) {
    //     map.touchZoom.enable();
    //     map.scrollWheelZoom.enable();
    //     $(".pi-map-overlay").addClass("hide");
    //   } else {
    //     map.touchZoom.disable();
    //     map.scrollWheelZoom.disable();
    //     $(".pi-map-overlay").removeClass("hide");
    //   }
    // });

    // Listen for wheel event on the map container
    // $(map.getContainer()).on('wheel', function(event) {
    //   // Show the overlay
    //   $('.pi-map-overlay').removeClass('hide');
    //   $('.pi-map-overlay').fadeIn();
    //   map.scrollWheelZoom.disable();

    //   // Hide the overlay after a delay
    //   setTimeout(function() {
    //       $('.pi-map-overlay').fadeOut();
    //   }, 1000); // 300 milliseconds delay (adjust as needed)
    // });
  }

  /** DatePicker Filter **/

  $(".pi-checkin").each(function () {
    $(this).flatpickr({
      // Set the default date to the current date
      minDate: "today",
      defaultDate: "today",
      // Define the date format if needed
      dateFormat: "Y-m-d",
      // Additional options as needed
    });
  });

  /** Set up Flatpickr for .pi-checkout using jQuery **/

  $(".pi-checkout").each(function () {
    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    $(this).flatpickr({
      // Set the default date to tomorrow
      minDate: tomorrow,

      defaultDate: tomorrow,
      // Define the date format if needed
      dateFormat: "Y-m-d",
      // Additional options as needed
    });
  });

  /** DropdDown Filter **/
  $(document).on("click", function (event) {
    // Check if the click event target is not inside .ft-dropdown-filters

    $('.dropdown-filters').each(function(){
      const $drop_down = $(this);
      if (!$(event.target).closest($drop_down).length) {
        // Remove the 'active' class from .ft-dropdown-filters
  
        $($drop_down).removeClass("active");
      }
    });
    
  });

  $(".dropdown-filters .filter-input").each(function () {
    const $this = $(this);

    $this.on("click", function (e) {
      
    });
  });


  $('.dropdown-filters').each(function(){

    $container = $(this);

    $container.find('.filter-input').on('click', function(e){
      e.preventDefault();
      $(this).closest('.dropdown-filters').not($(this).parent()).removeClass("active");
      $(this).parent().toggleClass("active");
    });

    $container.find('a').on("click", function (e) {
      e.preventDefault();
  
      

      const $this = $(this);
  
      $this.parent().parent().find("li").removeClass("active");
  
      $this.parent().parent().parent().removeClass("active");
  
      $this.parent().addClass("active");
  
      $this
        .parent()
        .parent()
        .parent()
        .find(".filter-input > .value")
        .html($(this).html())
        .data("value", $(this).data("code"));
    });
  });

  



  $(".pi-book-now").each(function () {
    $(this).on("click", function () {
      const $parent = $(this).closest(".pi-poa-container");

      const isValid = validateField($parent);

      if (isValid === false) {
        return false;
      }

      const url_params = parse_area_booking_data($parent);
      const booking_url = PI_DATA.booking_area_url + url_params;

      // Open the booking URL in a new tab
      window.open(booking_url, "_blank");
    });
  });

  /** Hotel Booking Search **/

  $(".pi-hotel-booking-actions > button").each(function () {
    const $this = $(this);

    $this.on("click", function () {
      const $container = $(this).parent().parent();
      const checkin = $container.find(".pi-checkin").val();
      const checkout = $container.find(".pi-checkout").val();
      const hotelCode = $(this).data("hotel-code");

      const url = `https://book.palaceinn.com/?hotel=${hotelCode}&checkin=${checkin}&checkout=${checkout}`;
      // Open the booking URL in a new tab
      window.open(url, "_blank");
    });
  });

  /** Hotel More Info Popup**/
  $("#pi-open-pop").on("click", function (e) {
    e.preventDefault();
    Fancybox.show([{ src: "#pi-pop-up-content", type: "inline" }]);
    return false;
  });

  /** Book Now PopUp **/

  $('#header-cta a').on('click', function(e){
    e.preventDefault();
    console.log('Clicked');
    Fancybox.show([{ src: "#pi-book-now-pop-content", type: "inline" }]);
    return false;
  })


  /**  Bind Autocomplete to Address TextBox **/
  $(".pi-address").each(function () {
    const $address = $(this);
    $address.autocomplete({
      source: function (request, response) {
        $.ajax({
          url: PI_DATA.ajaxMapUrl,
          type: "GET",
          dataType: "json",
          data: {
            action: "pi_autocomplete_address",
            input: request.term,
          },
          success: function ({ success, data }) {
            if (success && data) {
              if (data && data.predictions) {
                var addresses = data.predictions.map(function (prediction) {
                  return prediction.description;
                });
                response(addresses);
              }
              // response(data.data);
            } else {
              console.log("No data found.");
              response([]);
            }
          },
          error: function (xhr, status, error) {
            console.error("Error fetching autocomplete suggestions:", error);
            response([]);
          },
        });
      },
      minLength: 3,
      select: function (event, ui) {
        const selectedAddress = ui.item.value;
        
        $.ajax({
          url: PI_DATA.ajaxMapUrl,
          type: "GET",
          dataType: "json",
          data: {
            action: "pi_address_geocode",
            address: selectedAddress,
          },
          success: function ({ data, success }) {
            if (success) {
              const latLng = [data.lat, data.lng];

              // Reset Miles to 5 Miles
              $('#miles a').removeClass('active');
              $('#miles a[data-miles="15"').addClass('active');
          

              $address.attr("data-coordinates", latLng);

              // Update Leaflet map center
              const miles = parseInt($("#miles a.active").data("miles"));
              const radiusInMeters = miles * 1609.34; 

              const user_lat = data.lat;
              const user_lang = data.lng;

              
              // const zoomLevel = calculateZoomLevel(map, latLng, miles);

              setZoomToBounds(getLatLngBounds(parseFloat(miles * 1609.34)));
              centerMapOnCoordinates(data.lat, data.lng, 0);
              // map.setView(latLng, zoomLevel);
              $.ajax({
                url: PI_DATA.ajaxMapUrl,
                type: 'POST',
                dataType: "json",
                data: {
                  action: 'pi_hotel_location_query',
                  lat: data.lat,
                  lng: data.lng
                },
                success: function ({ data, success }) {
                  if (success){

                    let hotels = data.hotels;
                    // Implement your distance calculation function here (Haversine formula or Geolocation API)
                    function calculateDistance(point1, point2) {
                      const R = 6371e3; // Earth's radius in meters
                    
                      const lat1 = radians(point1[0]);
                      const lng1 = radians(point1[1]);
                      const lat2 = radians(point2[0]);
                      const lng2 = radians(point2[1]);
                    
                      const dLat = lat2 - lat1;
                      const dLon = lng2 - lng1;
                    
                      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos(lat1) * Math.cos(lat2) *
                                Math.sin(dLon / 2) * Math.sin(dLon / 2);
                      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    
                      const distance = R * c;
                    
                      return distance;
                    }

                    function haversineGreatCircleDistance(latitudeFrom, longitudeFrom, latitudeTo, longitudeTo, earthRadius = 6371000) {
                      // Convert degrees to radians
                      const latFromRad = Math.PI * latitudeFrom / 180;
                      const lonFromRad = Math.PI * longitudeFrom / 180;
                      const latToRad = Math.PI * latitudeTo / 180;
                      const lonToRad = Math.PI * longitudeTo / 180;
                    
                      const latDelta = latToRad - latFromRad;
                      const lonDelta = lonToRad - lonFromRad;
                    
                      const a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
                          Math.cos(latFromRad) * Math.cos(latToRad) *
                          Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2);
                    
                      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    
                      return earthRadius * c;
                    }
                    
                    // Helper function to convert degrees to radians
                    function radians(degrees) {
                      return degrees * Math.PI / 180;
                    }

                    let hotelsWithinRadius = data.lists.filter(function (hotel) {
                      var coords = hotel.coordinates.split(",").map(function (coord) {
                        return parseFloat(coord.trim());
                      });                     

                      // const distance = calculateDistance(coords[0], coords[1]);
                      const distance  = haversineGreatCircleDistance(coords[0], coords[1], user_lat, user_lang);
                      return distance <= radiusInMeters;
                    });

                    // console.log('hotel with radius', hotelsWithinRadius);
                    if (hotelsWithinRadius.length === 0) {
                      $('.pi-not-found').removeClass('hide');
                      updateGoogleMapPins(PI_DATA.mapCoordinates, true);
                      // centerMapOnCoordinates(29.76035220031458, -95.3665050615942);

                      
                      // console.log("No hotels found within a 15-mile radius.");
                      
                    } else{
                      $('.pi-not-found').addClass('hide');
                      $('.pi-hotel-lists').empty();
                      $('.pi-hotel-lists').html(hotels);

                      // console.log(data.coordinates);
                      updateGoogleMapPins(data.coordinates);
                    }

                    
                 
                  }
                }
              });
            }
          },
        });
      },
    });
  });

  /**  Miles Click Event **/
  $("#miles a").each(function () {
    $(this).on("click", function (e) {
      e.preventDefault();

      if ($("#pi-address").data('coordinates') !== '') {
        const miles = $(this).data("miles");
        const coordinates = $("#pi-address").data("coordinates").split(",");
        const latLng = [parseFloat(coordinates[0]), parseFloat(coordinates[1])];

        try {
          // const zoomLevel = calculateZoomLevel(map, latLng, miles);
          // map.setView(latLng, zoomLevel);
          // console.log(parseFloat(miles * 1609.34));
          setZoomToBounds(getLatLngBounds(parseFloat(miles * 1609.34)));
        } catch (error) {
          console.error("Error calculating zoom level:", error);
        }
      }

      $("#miles a").removeClass("active");
      $(this).addClass("active");
      return false;
    });
  });

  if ($("#pi-map2").length) {
    // initializeMap(PI_DATA.mapCoordinates);
    initGoogleMap(PI_DATA.mapCoordinates);
    $('#pi-map2').on('click', function(e){
      e.preventDefault();
      // $('.property').removeClass('highlight');
    });
  }

  /**  Check if Page is Single Hotel Page and Append Hotel ID**/

  if (PI_DATA.hotel_post_id) {
    $(".pi-contact a").each(function (e) {
      const href = $(this).attr("href");
      const hotel_id = PI_DATA.hotel_post_id;

      const url = href + "?hotel_id=" + hotel_id;

      $(this).attr("href", url);
    });
  }

  /**  Auto populate Select Field with Lists of Hotels **/

  if ($("#form-field-pi_hotel_lists").length) {
    const hotels = PI_DATA.hotels;
    const selectField = $("#form-field-pi_hotel_lists");
    const hotelIdFromUrl = new URLSearchParams(window.location.search).get(
      "hotel_id"
    );

    // Clear existing options if needed
    selectField.empty();

    // Add default option
    const defaultOption = $("<option></option>").text("Select Hotel/Organization").val("");
    selectField.append(defaultOption);

    // Append options based on the hotels array
    hotels.forEach((hotel) => {
      // Create option element
      const option = $("<option></option>");
      const decodedTitle = $("<div/>").html(hotel.title).text();

      // Set value and text for the option
      option.val(decodedTitle).text(decodedTitle);

      // Check if this option should be selected
      if (hotelIdFromUrl && hotel.ID.toString() === hotelIdFromUrl) {
        option.prop("selected", true);
      }

      // Append the option to the select field
      selectField.append(option);
    });
  }

  /**   Attach change event listener to the checkbox  **/

  const checkbox = $("#form-field-non_property_related-0");
  const hotelListsField = $("#form-field-pi_hotel_lists");

  if (checkbox.length) {
      checkbox.on("change", function () {
          // Check if the checkbox is checked
          hotelListsField.val('');
          if ($(this).is(":checked")) {
              // If checked, hide #form-field-pi_hotel_lists
              $(".elementor-field-group-pi_hotel_lists").hide();
          } else {
              // If not checked, show #form-field-pi_hotel_lists
              $(".elementor-field-group-pi_hotel_lists").show();
          }
      });
  }

  
  
});
