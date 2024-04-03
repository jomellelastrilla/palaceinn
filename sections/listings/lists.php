<div class="pi-hotel-lists">
 <?php 
  foreach($args['hotels'] as $hotel):
    get_template_part('sections/listings/card', 'null', array('hotel' => $hotel) ); 
  endforeach;
 ?>
</div>