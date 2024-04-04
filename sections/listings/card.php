<?php 
  $hotel = $args['hotel'];
  $order = $args['order'];
?>

<div class="pi-hotel-item <?= $hotel['color']; ?>" data-distance="<?= $hotel['distance']; ?>">
  <span class="order"><?= $order; ?></span>
  <h3>
    <a href="<?= $hotel['link']; ?>">Palace Inn<?= $hotel['title']; ?></a>
  </h3>
  <p class="price">Rates Starting from <span>$<?= $hotel['starting_price']; ?></span></p>
  <a href="<?= $hotel['link']; ?>">
    <img class="pi-featured-image" src="<?= $hotel['image']; ?>"/>
  </a>
  <div class="pi-more-info">
    <p class="pi-address"><?= $hotel['address']; ?></p>
    <a href="tel:+502-8778" class="pi-contact-number"><i class="fas fa-phone"></i> <?= $hotel['phone']; ?></a>
    <div class="pi-actions">
      <a href="<?= $hotel['link']; ?>" class="more-info">More Info</a>
      <a href="<?= $hotel['booking_url']; ?>" class="book-now">Book Now</a>
    </div>
  </div>
</div>