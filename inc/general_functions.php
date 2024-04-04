<?php 

function pi_localize_scripts() {
  $args =  array(
    'booking_area_url'      => 'https://book.palaceinn.com/area?',
    'gid'                   => defined('G_MAP_ID') ? G_MAP_ID : 'FALSE',
    'ajaxMapUrl'            => site_url('wp-admin/admin-ajax.php'),
    'mapCoordinates'        => pi_hotel_map_places(),
    'user_coordinates'      => pi_get_user_coordinates(),
    'user_ip'               => $_SERVER['REMOTE_ADDR'],
  );


  if (is_singular() && get_post_type() == 'hotels'):
    $args['hotel_post_id'] = get_the_ID();
  endif;

  if ( is_page('contact-us') ):
    $args['hotels'] = pi_hotel_lists();
    $args['hotel_id'] = isset($_GET['hotel_id']) ? $_GET['hotel_id'] : false; 
  endif;

  wp_localize_script('pi-script','PI_DATA', $args);    
}

function pi_poa_data(){
  // Get the directory of the current script
  $script_directory = __DIR__;
  
  // Construct the absolute path to the JSON file
  $json_path = $script_directory . '/../data/pi-poa.json';

  // Read the JSON file
  $json = file_get_contents($json_path);

  // Decode the JSON file
  $json_data = json_decode($json, true);

  // Sort the array based on the "region" field
  usort($json_data['area'], function($a, $b) {
    return strcmp($a['region'], $b['region']);
  });

  return $json_data;
}

function pi_hotel_map_places() {
  $args = array(
    'post_type'      => 'hotels',
    'post_status'    => 'publish',
    'posts_per_page' => -1, // -1 to display all posts, you can change it to any number
    'orderby'        => 'DATE', // Order by date published
    'order'          => 'ASC', 
  );

  $query = new WP_Query( $args );

  if ( $query->have_posts() ) {
    $list = array();
    $order = 1;
      while ( $query->have_posts() ) {
          $query->the_post();
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
            'starting_price'=> get_field('staring_price')
          ));
          $order++;
      }     
    wp_reset_postdata(); // Restore original post data
    return $list;
  } else {
      // No posts found
  }
}

function pi_color_code_text($hex){
  if ($hex === '#002D9F'):
    return 'blue';
  else:
    return 'red';
  endif;
}


function pi_hotel_order_number($post_ID) {
  $args = array(
    'post_type'      => 'hotels',
    'post_status'    => 'publish',
    'posts_per_page' => -1, // -1 to display all posts, you can change it to any number
    'orderby'        => 'DATE', // Order by date published
    'order'          => 'ASC', 
  );

  $query = new WP_Query( $args );

  
  if ( $query->have_posts() ) {
    $order = 1;  
    while ( $query->have_posts() ) {
      $query->the_post();
      $id = get_the_ID();
      if ($post_ID ===  $id ){        
        return $order;
      }
      $order++;
    }
  }
  return ;
}

function pi_hotel_lists() {
  $args = array(
    'post_type'      => 'hotels',
    'post_status'    => 'publish',
    'posts_per_page' => -1, // -1 to display all posts, you can change it to any number
    'orderby'        => 'title', // Order by date published
    'order'          => 'ASC', 
  );

  $query = new WP_Query( $args );

  if ( $query->have_posts() ) {
    $list = array();
      while ( $query->have_posts() ) {
          $query->the_post();
          // Output your post content or other information here
        
          array_push($list, array(
            'ID'          => get_the_ID(),
            'title'       => esc_html(get_the_title()),           
          ));
         
      }     
    wp_reset_postdata(); // Restore original post data
    return $list;
  } else {
      // No posts found
  }
}

function pi_get_user_coordinates() {
  // Get the user's IP address
  $user_ip = $_SERVER['REMOTE_ADDR'];

  // Replace "YOUR_API_KEY" with your actual Google Maps API key
  $api_key = G_MAP_ID;

  // API endpoint for geocoding based on IP address
  $api_endpoint = "https://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($user_ip) . "&key=" . $api_key;

  // Make a request to the Google Maps Geocoding API
  $response = file_get_contents($api_endpoint);

  // Parse the JSON response
  $data = json_decode($response, true);

  // Check if the response contains valid data
  if ($data && $data['status'] === 'OK') {
      // Extract latitude and longitude from the response
      $latitude = $data['results'][0]['geometry']['location']['lat'];
      $longitude = $data['results'][0]['geometry']['location']['lng'];

      // Return the coordinates
      return array('latitude' => $latitude, 'longitude' => $longitude);
  } else {
      // Error handling
      return null;
  }
}

function haversineGreatCircleDistance($latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000) {
  // Convert degrees to radians
  $latFromRad = deg2rad($latitudeFrom);
  $lonFromRad = deg2rad($longitudeFrom);
  $latToRad = deg2rad($latitudeTo);
  $lonToRad = deg2rad($longitudeTo);

  $latDelta = $latToRad - $latFromRad;
  $lonDelta = $lonToRad - $lonFromRad;

  $a = sin($latDelta / 2) * sin($latDelta / 2) +
      cos($latFromRad) * cos($latToRad) *
      sin($lonDelta / 2) * sin($lonDelta / 2);

  $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

  return $earthRadius * $c;
}

function calculate_distance($lat1, $lon1, $lat2, $lon2, $unit = 'mi') {
  // Convert latitude and longitude from degrees to radians
  $lat1 = deg2rad($lat1);
  $lon1 = deg2rad($lon1);
  $lat2 = deg2rad($lat2);
  $lon2 = deg2rad($lon2);

  // Radius of the Earth in the chosen unit (default is miles)
  $radius = ($unit == 'km') ? 6371 : 3959;

  // Haversine formula
  $delta_lat = $lat2 - $lat1;
  $delta_lon = $lon2 - $lon1;
  $a = sin($delta_lat / 2) * sin($delta_lat / 2) + cos($lat1) * cos($lat2) * sin($delta_lon / 2) * sin($delta_lon / 2);
  $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
  $distance = $radius * $c;

  return $distance;
}

?>
