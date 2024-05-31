<?php 

 $areas = pi_poa_data();
?>

<div class="pi-poa-container">
  <div class="pi-poa-item item-1">
    <label>Point of Interest</label>
    <div class="dropdown-filters">
      <div class="filter-input" tabindex="0">
        <div data-value="" class="value">Where are you going?</div>
        <i class="fa fa-chevron-down"></i>
      </div>
      <ul class="filter-options">
          <li class="active">
            <a href="#" data-code="" class="dropdown-item">
              All Locations
            </a>
          </li>
          <?php foreach($areas['area'] as $area) : ?>
          <li>
            <a href="#" data-code="<?= $area['code']; ?>" class="dropdown-item">
              <?= $area['region']; ?>               
            </a>
          </li>
          <?php endforeach; ?>
      </ul>
    </div>    
  </div>
  <div class="pi-poa-item  item-2">
    <label>Check In</label>    
    <input type="text" class="pi-datepicker pi-checkin" placeholder="MM-DD-YYYY" id="pi-checkin" readonly="readonly" tabindex="1"/>
    <span class="pi-datepicker-icon"><i class="fas fa-solid fa-calendar-days"></i></span>
  </div>
  <div class="pi-poa-item  item-3">
    <label>Checkout</label>
    <input type="text" class="pi-datepicker pi-checkout" placeholder="MM-DD-YYYY" id="pi-checkout"  readonly="readonly" />
    <span class="pi-datepicker-icon"><i class="fas fa-solid fa-calendar-days"></i></span>
  </div> 
  <div class="pi-poa-item button-action  item-4">
    <button class="pi-book-now" href="#">Book Now</button>
  </div>  
</div>