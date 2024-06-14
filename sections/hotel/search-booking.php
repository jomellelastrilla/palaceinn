<div class="pi-hotel-booking-container">
  <div class="pi-hotel-field">
    <label for="pi-checkin">Check In</label>
    <input type="text" class="pi-datepicker pi-checkin" placeholder="MM-DD-YYYY" id="pi-checkin" name="pi-checkin" readonly="readonly" />
    <span class="pi-datepicker-icon"><i class="fas fa-solid fa-calendar-days"></i></span>
  </div>
  <div class="pi-hotel-field">
  <label for="pi-checkout">Checkout</label>
    <input type="text" class="pi-datepicker pi-checkout" placeholder="MM-DD-YYYY" id="pi-checkout" name="pi-checkout" readonly="readonly" />
    <span class="pi-datepicker-icon"><i class="fas fa-solid fa-calendar-days"></i></span>
  </div>
  <div class="pi-hotel-field pi-hotel-booking-actions actions">
    <button class="search" data-hotel-code="<?= $args['hotel_code']?>" target="_blank">BOOK NOW</button>
  </div>
</div>