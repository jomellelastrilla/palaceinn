<?php 
  $hotel = $args['hotel'];
  $order = $args['order'];
?>

<div class="pi-hotel-item pi-color-code-<?= $hotel['color']; ?> <?= $hotel['color']; ?>" data-distance="<?= $hotel['distance']; ?>">
  <span class="order"><?= $order; ?></span>
  <h3>
    <a href="<?= $hotel['link']; ?>">Palace Inn<?= $hotel['title']; ?></a>
  </h3>
  <p class="price">Rates Starting from <span>$<?= $hotel['starting_price']; ?></span></p>
  <a class="pi-featured-image"href="<?= $hotel['link']; ?>">
    <img src="<?= $hotel['image']; ?>"/>
  </a>
  <div class="pi-more-info">
    <p class="pi-location"><?= $hotel['address']; ?></p>
    <a href="tel:<?= $hotel['phone']; ?>" class="pi-contact-number"><i class="fas fa-phone"></i> <?= $hotel['phone']; ?></a>
    <div class="pi-actions">
      <a href="<?= $hotel['link']; ?>" class="more-info">More Info</a>
      <a href="<?= $hotel['booking_url']; ?>" class="book-now">Book Now</a>
    </div>
  </div>
</div>