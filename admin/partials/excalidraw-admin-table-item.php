<div class="excalidraw-admin-table-item">
  <div>
    <a href="<?php echo $url; ?>" class="preview"><img src="<?php echo $item->thumbnail; ?>" /></a>
  </div>
  <div>
    <h2 class="title"><a href="<?php echo $url; ?>"><?php echo $item->title ? $item->title : $item->uuid; ?></a></h2>
  </div>
</div>