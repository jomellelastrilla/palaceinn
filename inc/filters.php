<?php 
function pi_custom_body_class_function($classes) {
  if (is_singular('hotels')) {
      $classes[] = 'pi-color-theme'; // Add your custom class here
  }
  return $classes;
}

add_filter('body_class', 'pi_custom_body_class_function');



function add_async_attribute($tag, $handle, $src) {
  // Check if the script handle matches the Google Maps API script
  if ($handle === 'google-maps-api') {
      // Add the async attribute to the script tag
      $tag = '<script id="google-maps-api" src="' . esc_url($src) . '" async defer loading="async"></script>';
  }
  return $tag;
}
add_filter('script_loader_tag', 'add_async_attribute', 10, 3);

?>