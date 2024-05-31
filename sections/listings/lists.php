<div class="pi-hotel-lists">
 <?php 
  $order = 1; // Only used on initial load
  foreach($args['hotels'] as $hotel):    
    get_template_part('sections/listings/card', 'null', array('hotel' => $hotel, 'order' => $order) ); 
    $order++;
  endforeach;
 ?>
</div>