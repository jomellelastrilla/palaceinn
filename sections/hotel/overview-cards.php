
<?= wp_get_attachment_image( $args['image'], 'full' ); ?>

<?php if ($args['is_show_caption'] === 'true'): ?>

  <p class="txt"><?= $args['caption'];?></p>
  
<?php endif; ?>
