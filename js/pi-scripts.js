var $ = jQuery.noConflict();

$(function () {
  /** Map Initialize  **/

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

  if ($("#pi-map").length) {
    const initialCoordinates = [29.76035220031458, -95.3665050615942];

    var map = L.map("pi-map").setView(initialCoordinates, 13);
    // Add Google Maps as a tile layer
    L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 17,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attributionControl: false, // Disable the default attribution control
    }).addTo(map);

    map.scrollWheelZoom.disable();

    map.attributionControl.remove();

    $("#pi-map").on("wheel", function (e) {
      if (!e.ctrlKey) {
        map.scrollWheelZoom.disable();
        $(".pi-map-overlay").removeClass("hide");
      } else {
        map.scrollWheelZoom.enable();
        $(".pi-map-overlay").addClass("hide");
      }
    });

    $("#pi-map").on("touchstart", function (e) {
      if (e.originalEvent.touches.length > 1) {
        map.touchZoom.enable();
        map.scrollWheelZoom.enable();
        $(".pi-map-overlay").addClass("hide");
      } else {
        map.touchZoom.disable();
        map.scrollWheelZoom.disable();
        $(".pi-map-overlay").removeClass("hide");
      }
    });

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

  // Set up Flatpickr for .pi-checkout using jQuery

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
    if (!$(event.target).closest(".dropdown-filters").length) {
      // Remove the 'active' class from .ft-dropdown-filters

      $(".dropdown-filters").removeClass("active");
    }
  });

  $(".dropdown-filters .filter-input").each(function () {
    const $this = $(this);

    $this.on("click", function (e) {
      e.preventDefault();
      $(".dropdown-filters").not($this.parent()).removeClass("active");
      $(this).parent().toggleClass("active");
    });
  });

  $(".dropdown-filters a").on("click", function (e) {
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

              $address.attr("data-coordinates", latLng);

              // Update Leaflet map center
              const miles = parseInt($("#miles a.active").data("miles"));
              const zoomLevel = calculateZoomLevel(map, latLng, miles);
              map.setView(latLng, zoomLevel);
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

      if ($("#pi-address").val() !== "") {
        const miles = $(this).data("miles");
        const coordinates = $("#pi-address").data("coordinates").split(",");
        const latLng = [parseFloat(coordinates[0]), parseFloat(coordinates[1])];

        try {
          const zoomLevel = calculateZoomLevel(map, latLng, miles);
          map.setView(latLng, zoomLevel);
        } catch (error) {
          console.error("Error calculating zoom level:", error);
        }
      }

      $("#miles a").removeClass("active");
      $(this).addClass("active");
      return false;
    });
  });

  if ($("#pi-map").length) {
    initializeMap(PI_DATA.mapCoordinates);
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
