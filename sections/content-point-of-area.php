<?php 

 $areas = pi_poa_data();
?>

<div class="pi-poa-container">
  <div class="pi-poa-item">
    <label>Point of Interest</label>
    <div class="dropdown-filters">
      <div class="filter-input">
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
  <div class="pi-poa-item">
    <label>Arrival Date</label>    
    <input type="text" class="pi-datepicker pi-checkin" placeholder="MM-DD-YYYY" id="pi-checkin" readonly="readonly"/>
    <span class="pi-datepicker-icon"><i class="fas fa-solid fa-calendar-days"></i></span>
  </div>
  <div class="pi-poa-item">
    <label>Departure Date</label>
    <input type="text" class="pi-datepicker pi-checkout" placeholder="MM-DD-YYYY" id="pi-checkout"  readonly="readonly" />
    <span class="pi-datepicker-icon"><i class="fas fa-solid fa-calendar-days"></i></span>
  </div> 
  <div class="pi-poa-item button-action">
    <button class="pi-book-now" href="#">Book Now</button>
  </div>  
</div>