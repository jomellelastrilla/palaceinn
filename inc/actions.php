<?php 


function pi_color_theme_function() {
    if (is_singular('hotels')) :
      global $post;
      $post_ID = $post->ID;
      $color = get_field('color_code', $post_ID);

      if ($color === '#002D9F'): //Dark Blue
        $map_bullet = site_url('/wp-content/uploads/2024/01/map-pin.png');
        $blue_display = 'flex';
        $red_display = 'none';
      else:  //Dark Red
        $map_bullet = site_url('/wp-content/uploads/2024/02/map-pin-red.png');
        $blue_display = 'none';
        $red_display = 'flex';
      endif;
  ?>

 
  <style type="text/css">
      .pi-color-theme {
          --palace-inn-color-theme: <?= $color; ?>;
          --palace-inn-map-bullet: url("<?= $map_bullet; ?>");
          --palace-inn-amenities-blue: <?= $blue_display ?>;
          --palace-inn-amenities-red: <?= $red_display ?>;
      }
  </style>
  <?php
    endif;
}

add_action('wp_head', 'pi_color_theme_function');

function pi_autocomplete_address() {
    $input = $_GET['input'];
    $api_key = G_PLACE_ID;
    $url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' . urlencode($input) . '&key=' . $api_key . '&types=geocode';

    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        wp_send_json_error();
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if ($data && isset($data['predictions'])) {
        // $addresses = array_column($data['predictions'], 'description');
        // wp_send_json_success($addresses);
        wp_send_json_success($data);
    } else {
        wp_send_json_error();
    }
}

add_action('wp_ajax_pi_autocomplete_address', 'pi_autocomplete_address');
add_action('wp_ajax_nopriv_pi_autocomplete_address', 'pi_autocomplete_address');

// Function to handle the geocoding request
function pi_geocode_address() {
  // Check if address parameter is set
  if (isset($_GET['address'])) {
      // Get the address parameter
      $address = $_GET['address'];

      // Make a geocoding request to Google Geocoding API
      // Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual Google Maps API key
      $api_key = G_GEOCODING_ID;
      $url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' . urlencode($address) . '&key=' . $api_key;

      // Make the request
      $response = wp_remote_get($url);

      // Check if the request was successful
      if (!is_wp_error($response)) {
          $body = wp_remote_retrieve_body($response);
          $data = json_decode($body, true);

          // Check if the response contains results
          if ($data && $data['status'] === 'OK') {
              // Extract the latitude and longitude coordinates
              $lat = $data['results'][0]['geometry']['location']['lat'];
              $lng = $data['results'][0]['geometry']['location']['lng'];

              // Return the coordinates as a JSON response
              wp_send_json_success(array('lat' => $lat, 'lng' => $lng));
          } else {
              // Return an error response
              wp_send_json_error('Unable to geocode the address');
          }
      } else {
          // Return an error response
          wp_send_json_error('Error making geocoding request');
      }
  } else {
      // Return an error response
      wp_send_json_error('Address parameter is missing');
  }
}

// Register the AJAX action for geocoding
add_action('wp_ajax_pi_address_geocode', 'pi_geocode_address');
add_action('wp_ajax_nopriv_pi_address_geocode', 'pi_geocode_address');


function pi_featured_hotels_function( $query ) {
  // Check if it's the main query and if it's for the post type you want
 
      // Modify the query to prioritize posts where is_featured is true
      $query->set( 'meta_key', 'is_featured' );
      $query->set( 'meta_value', '1' ); // Assuming ACF stores true as '1'
      $query->set( 'meta_compare', '=' );
      $query->set( 'orderby', 'meta_value' ); // Order by the value of is_featured
      $query->set( 'order', 'DESC' ); // Show featured posts first
  
}
add_action( 'elementor/query/pi_featured_hotels', 'pi_featured_hotels_function' );

?>