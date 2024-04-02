<?php
/**
 * Theme functions and definitions.
 *
 * For additional information on potential customization options,
 * read the developers' documentation:
 *
 * https://developers.elementor.com/docs/hello-elementor-theme/
 *
 * @package HelloElementorChild
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

define( 'HELLO_ELEMENTOR_CHILD_VERSION', '2.0.0' );
define('PI_DIR', get_stylesheet_directory() . '/inc');
define('PI_VERSION', rand(0,10) . '.' . rand(0,10) . '.' .rand(1,10));
DEFINE('PI_NONCE', 'iy2VWT03w0RefAD1Hrc9wN5W');

require_once PI_DIR .'/general_functions.php';
require_once PI_DIR .'/filters.php';
require_once PI_DIR .'/actions.php';
require_once PI_DIR .'/shortcodes.php';


/**
 * Load child theme scripts & styles.
 *
 * @return void
 */
function hello_elementor_child_scripts_styles() {

	wp_enqueue_style(
		'hello-elementor-child-style',
		get_stylesheet_directory_uri() . '/style.css',
		[
			'hello-elementor-theme-style',
		],
		HELLO_ELEMENTOR_CHILD_VERSION
	);

  wp_enqueue_style( 'pi-flatpickr', 'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css', null, PI_VERSION );
  wp_enqueue_style( 'pi-flatpickr-monthpicker', 'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/plugins/monthSelect/style.min.css', null, PI_VERSION );
  wp_enqueue_style( 'pi-fancybox', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css', null, PI_VERSION );

  wp_enqueue_script('jquery-ui-autocomplete');  
  wp_enqueue_script('pi-flatpickr', 'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js', array('jquery'), PI_VERSION, TRUE);  
  wp_enqueue_script('pi-fancybox', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js', array('jquery'), PI_VERSION, TRUE);

 
    wp_enqueue_style( 'pi-leaflet-styles', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css', array('hello-elementor-child-style'), PI_VERSION );
   
    wp_enqueue_script('pi-leaflet-scripts', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js', array('jquery'), PI_VERSION, TRUE);
    
 


  wp_enqueue_script('pi-script', get_stylesheet_directory_uri() . '/js/pi-scripts.js', array('jquery'), PI_VERSION, TRUE);

  wp_enqueue_script('google-maps-api', 'https://maps.googleapis.com/maps/api/js?key=' . G_MAP_ID . '&callback=initGoogleMap', array('jquery'), null, true);
  pi_localize_scripts(); 

}
add_action( 'wp_enqueue_scripts', 'hello_elementor_child_scripts_styles', 20 );
