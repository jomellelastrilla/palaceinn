<?php 
 $post_ID = $args['post_ID'];
?>
<div id="pi-pop-up-content" class="pi-pop-up-content">  
  <h3>MORE INFORMATION</h3>
  <div class="pop-content">
    <p>
    <strong>Number of Rooms: </strong> <?= get_field('number_of_rooms', $post_ID);?>
    </p>
    <p>
    <strong>Hotel Location: </strong> <?= get_field('hotel_location', $post_ID);?>   
    </p>
    <p>
    <strong>Check In Time: </strong> <?= get_field('check_in_time', $post_ID);?>
    </p>
    <p>
    <strong>Check Out Time: </strong> <?= get_field('check_out_time', $post_ID);?>
    </p>
    <p>
    <strong>Closest Airport: </strong> <br /><?= get_field('closest_airport', $post_ID);?>
    </p>
    <p>
    <strong>Hotel Services: </strong><br /> <?= get_field('hotel_services', $post_ID);?>
    </p>
    <p>
    <strong>In-Room Amenity List: </strong><br /> <?= get_field('in_room_amenity_list', $post_ID);?>
    </p>
    <p>
    <strong>Security Features: </strong><br /> <?= get_field('security_features', $post_ID);?>
    </p>
    <h2>Our Location</h2> 
    <?= get_field('our_location_content', $post_ID);?> 
    <h2>Hotel Overview</h2>
    <?= get_field('hotel_amenities_content', $post_ID);?> 
  </div>
</div>