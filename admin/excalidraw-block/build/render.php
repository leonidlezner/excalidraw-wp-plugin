<?php
if (!empty($attributes['docId'])) {
	$doc = Excalidraw::get_document_from_db($attributes['docId']);

	if (!$doc) {
		return;
	}
} else {
	return;
}
?>
<div <?php echo get_block_wrapper_attributes(); ?>>
	<div class="excalidraw-doc"> <?php echo $doc->full; ?></div>
</div>