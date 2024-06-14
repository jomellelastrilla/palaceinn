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


function pi_hotel_location_query_function(){
  if ( isset($_POST['lat']) &&  isset($_POST['lng'])) :

    $user_lat = (float) sanitize_text_field($_POST['lat']);
    $user_lng = (float) sanitize_text_field($_POST['lng']);
    
    // Build custom post type query with geospatial filter
    $args = array(
      'post_type' => 'hotels', // Replace with your custom post type slug
      'post_status'    => 'publish',
      'posts_per_page' => -1, // Get all hotels
      'meta_query' => array(
        array(
          'key' => 'coordinates', // Replace with your ACF field name
          'compare' => 'EXISTS'
        )
      ),
      'orderby' => array(
        'meta_value_num' => 'ASC', // Order by distance (replace with your distance calculation logic)
      )
    );

    $query = new WP_Query($args);
    // Extract coordinates from ACF field (replace with your logic)
    if ($query->have_posts()) {
      $list = array();
      $order = 1;
      while ($query->have_posts()) {
        $query->the_post();
        $hotel_id = get_the_ID();
        $hotel_coordinates_string = get_field('coordinates', $hotel_id); // Replace with your ACF field retrieval code
        $hotel_coordinates = explode(", ", $hotel_coordinates_string);

        // Ensure we have valid coordinates
        //if (count($hotel_coordinates) === 2) {
          $hotel_lat = (float) $hotel_coordinates[0];
          $hotel_lng = (float) $hotel_coordinates[1];

          // Calculate distance between user and hotel coordinates (replace with your preferred formula)
          // $distance = haversineGreatCircleDistance($user_lat, $user_lng, $hotel_lat, $hotel_lng);
          $distance = calculate_distance($user_lat, $user_lng, $hotel_lat, $hotel_lng);

          // Output your post content or other information here
          $featured_image_url = get_the_post_thumbnail_url( get_the_ID(), 'full' );
          $color_code = pi_color_code_text(get_field('color_code'));

          array_push($list, array(
            'ID'          => get_the_ID(),
            'title'       => esc_html(get_the_title()),
            'image'       => esc_url( $featured_image_url ),
            'link'        => get_permalink(),
            'address'     => get_field('address'),
            'booking_url' => 'https://book.palaceinn.com/?hotel=' . get_field('hotel_id'),
            'coordinates' => get_field('coordinates'),
            'color'       => $color_code,
            'map_pin'     => site_url('/wp-content/themes/hello-theme-child/assets/' . $color_code . '-marker-plain.png'),
            'phone'       => get_field('contact_number'),
            'order'       => $order,
            'starting_price'=> get_field('staring_price'),
            'distance' => $distance
          ));
          $order++;
          
        // }
        
      }


      // Sort hotels by distance (ascending)
      usort($list, function($a, $b) {
        return $a['distance'] <=> $b['distance'];
      });


      if (is_array($list)) { // Check if $list is actually an array
        $i = 1;
        foreach ($list as &$item) { // Iterate with reference
            $item['order'] = $i;
            $i++;
        }
      }
      

      ob_start();
      $count = 1;
      foreach($list as $hotel):        
        get_template_part('sections/listings/card', 'null', array('hotel' => $hotel, 'order' => $count) ); 
        $count++;
      endforeach;
      $content = ob_get_clean();

      
      wp_reset_postdata();
      
      // Send response containing hotel data (replace with your desired data structure)
      wp_send_json_success(array('coordinates' => $list, 'hotels' => $content, 'lists' => $list));
    }
  endif;
}

// Register the AJAX action for location query
add_action('wp_ajax_pi_hotel_location_query', 'pi_hotel_location_query_function');
add_action('wp_ajax_nopriv_pi_hotel_location_query', 'pi_hotel_location_query_function');

?>