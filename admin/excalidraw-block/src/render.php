<?php
if (!empty($attributes['docId'])) {
	$doc = Excalidraw::get_document_from_db($attributes['docId']);

	if (!$doc) {
		return;
	}

	$alignment = $attributes['alignment'];
	$width = $attributes['width'];
	$showTitle = $attributes['showTitle'];

	$styleContainer = "text-align: $alignment;";
	$styleDoc = "width: $width%;";
} else {
	return;
}
?>
<div <?php echo get_block_wrapper_attributes(); ?>>
	<div class="excalidraw-doc-container" style="<?php echo $styleContainer; ?>">
		<div class="excalidraw-doc" style="<?php echo $styleDoc; ?>">
			<?php echo $doc->full; ?>
		</div>
	</div>
	<?php if ($showTitle && $doc->title) : ?>
		<div class="excalidraw-doc-title"><?php echo $doc->title; ?></div>
	<?php endif; ?>
</div>