<div class="wrap">
  <h1 class="wp-heading-inline"><?php echo esc_html(get_admin_page_title()); ?></h1>

  <?php
  if (current_user_can('upload_files')) {
  ?>
    <a href="<?php echo esc_url(admin_url('admin.php?page=excalidraw&view=new')); ?>" class="page-title-action"><?php echo esc_html__('Add New Drawing'); ?></a>
  <?php
  }

  if (isset($_REQUEST['s']) && strlen($_REQUEST['s'])) {
    echo '<span class="subtitle">';
    printf(
      /* translators: %s: Search query. */
      __('Search results for: %s'),
      '<strong>' . get_search_query() . '</strong>'
    );
    echo '</span>';
  }
  ?>

  <hr class="wp-header-end">

  <?php
  if ($message) {
    wp_admin_notice(
      $message['message'],
      array(
        'id'                 => 'message',
        'dismissible'        => true,
        'type'               => $message['type']
      )
    );
  }
  ?>

  <?php $table->display(); ?>
</div>