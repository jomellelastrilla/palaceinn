<?php 
  $hotel = $args['hotel'];
?>

<div class="pi-hotel-item <?= $hotel['color']; ?>">
  <span class="order"><?= $hotel['order']; ?></span>
  <h3><?= $hotel['title']; ?></h3>
  <p class="price">Rates Starting from $<span><?= $hotel['starting_price']; ?></span></p>
  <img class="pi-featured-image" src="<?= $hotel['image']; ?>"/>
  <div class="pi-more-info">
    <p class="pi-address"><?= $hotel['address']; ?></p>
    <a href="tel:+502-8778" class="pi-contact-number"><i class="fas fa-phone"></i> <?= $hotel['phone']; ?></a>
    <div class="pi-actions">
      <a href="<?= $hotel['link']; ?>" class="more-info">More Info</a>
      <a href="<?= $hotel['booking_url']; ?>" class="book-now">Book Now</a>
    </div>
  </div>
</div>