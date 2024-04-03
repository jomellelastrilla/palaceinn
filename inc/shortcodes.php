<?php 
function pi_point_of_area_booking_function() {
  ob_start();

  get_template_part('sections/content' , 'point-of-area');
  $content = ob_get_clean();

  return $content;
}

add_shortcode('pi_point_of_area_booking', 'pi_point_of_area_booking_function');

function pi_hotel_listings_function() {
  ob_start();

  get_template_part('sections/content' , 'hotel-listings');
  $content = ob_get_clean();

  return $content;
}


add_shortcode('pi_hotel_listings', 'pi_hotel_listings_function');


function pi_hotel_booking_url_function () {
  global $post;
  $post_ID = $post->ID;
  
  return 'https://book.palaceinn.com/?hotel=' . get_field('hotel_id', $post_ID);
}

add_shortcode('pi_hotel_booking_url', 'pi_hotel_booking_url_function');

function pi_hotel_item_function($atts){
  $atts = shortcode_atts(
    array(
      'index' => '',   // Default value for 'index' attribute
      'caption' => 'false',  // Default value for 'source' attribute
    ),
    $atts,
    'pi_hotel_item'  // Shortcode name
  );

  global $post;
  $post_ID = $post->ID;

  $index = $atts['index'];
  $caption = $atts['caption'];

  $hotel_item = get_field('hotel_item_' . $index, $post_ID);

  ob_start();
  
  $args = array(
    'image'           => $hotel_item['hotel_image'],
    'is_show_caption' => $caption,
    'caption'         => $hotel_item['caption']
  );

  get_template_part('sections/hotel/overview', 'cards', $args);

  $content = ob_get_clean();

  return $content; 

}

add_shortcode('pi_hotel_item','pi_hotel_item_function');


function pi_hotel_contact_url_function () {
  global $post;
  $post_ID = $post->ID;
  
  return 'tel:+' . get_field('contact_number', $post_ID);
}

add_shortcode('pi_hotel_contact_url', 'pi_hotel_contact_url_function');

function pi_hotel_map_function () {
  global $post;
  $post_ID = $post->ID;
  
  return get_field('map_embed_code', $post_ID);
}

add_shortcode('pi_hotel_map', 'pi_hotel_map_function');


function pi_hotel_booking_search_function () {
  global $post;
  $post_ID = $post->ID;
  
  ob_start();
  $args = array(
    'post_ID' => $post_ID,
    'hotel_code' => get_field('hotel_id', $post_ID)
  );

  get_template_part('sections/hotel/search', 'booking', $args);

  $content = ob_get_clean();

  return $content; 
  
}

add_shortcode('pi_hotel_booking_search', 'pi_hotel_booking_search_function');


function pi_hotel_review_function($atts){
  $atts = shortcode_atts(
    array(
      'index' => '1',   // Default value for 'index' attribute
      'key'   => 'name'
    ),
    $atts,
    'pi_hotel_review'  // Shortcode name
  );

  global $post;
  $post_ID = $post->ID;

  $index = $atts['index'];
  $key = $atts['key'];

  $hotel_review = get_field('review_and_rating_group_' . $index, $post_ID);

  if ($key === 'star_rating'): 
    $star = '';
    $length = intval($hotel_review['star_rating']);
    for ($i = 1; $i <= $length; $i++){
      $star .= '<img src="' . esc_url(site_url('/wp-content/uploads/2024/01/star.png')) . '" alt="Star Rating" width="21" height="21" />';
    }

    return $star;
  else :

    return $hotel_review[$key];
  endif;

}

add_shortcode('pi_hotel_review','pi_hotel_review_function');


function pi_more_info_function(){
  ob_start();
  global $post;
  $post_ID = $post->ID;

  $args = array(
    'post_ID' => $post_ID
  );

  get_template_part('sections/hotel/pop-up', null, $args);

  $content = ob_get_clean();

  return $content; 
  
}

add_shortcode('pi_more_info', 'pi_more_info_function');

function pi_hotel_item_card_class_function(){
  global $post;
  $post_ID = $post->ID;

  $color = get_field('color_code', $post_ID);

  if ($color === '#002D9F'):
    return 'pi-color-code-blue';
  else:
    return 'pi-color-code-red';
  endif;
}

add_shortcode('pi_hotel_item_card_class', 'pi_hotel_item_card_class_function');


function pi_hotel_order_number_function(){
  global $post;
  return pi_hotel_order_number($post->ID);
}

add_shortcode('pi_hotel_order_number','pi_hotel_order_number_function');


function pi_hotel_lists_function() {
  ob_start();

  get_template_part('sections/listings/lists' , null, array('hotels' => pi_hotel_map_places()));
  $content = ob_get_clean();

  return $content;
}


add_shortcode('pi_hotel_lists', 'pi_hotel_lists_function');