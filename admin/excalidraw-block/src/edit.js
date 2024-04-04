import { __ } from "@wordpress/i18n";

import { useState } from "react";

import {
	BlockControls,
	InspectorControls,
	useBlockProps,
} from "@wordpress/block-editor";

import {
	Modal,
	ToolbarGroup,
	Toolbar,
	ToolbarButton,
	PanelBody,
	Popover,
	TextControl,
	ToggleControl,
} from "@wordpress/components";

import { edit, file, update } from "@wordpress/icons";

import "./editor.scss";
import Selector from "./components/Placeholder";
import DocContainer from "./components/DocContainer";
import Gallery from "./components/Gallery";

export default function Edit({ attributes, setAttributes }) {
	const { docId } = attributes;

	const [isGalleryVisible, setIsGalleryVisible] = useState(false);

	const handleSelectDocument = () => {
		setIsGalleryVisible(true);
	};

	const handleEdit = () => {
		window
			.open(window.EXCALIDRAW_BLOCK_DATA.editDocUrl + docId, "_blank")
			.focus();
	};

	const handleDocumentSelected = (doc) => {
		setAttributes({
			docId: doc.uuid,
		});

		setIsGalleryVisible(false);
	};

	return (
		<div {...useBlockProps()}>
			{/* <InspectorControls>
				<PanelBody title={__("Document", "excalidraw-block")}>

				</PanelBody>
			</InspectorControls> */}

			<BlockControls>
				{docId !== undefined && (
					<ToolbarGroup>
						<Toolbar>
							<ToolbarButton
								icon={update}
								label={__("Reload", "excalidraw-block")}
								onClick={() => {}}
							>
								{__("Reload", "excalidraw-block")}
							</ToolbarButton>
						</Toolbar>
						<Toolbar>
							<ToolbarButton
								icon={edit}
								label={__("Edit", "excalidraw-block")}
								onClick={handleEdit}
							>
								{__("Edit", "excalidraw-block")}
							</ToolbarButton>
						</Toolbar>
					</ToolbarGroup>
				)}
				<ToolbarGroup>
					<Toolbar>
						<ToolbarButton
							label={__("Replace", "excalidraw-block")}
							onClick={handleSelectDocument}
							icon={file}
						>
							{docId
								? __("Replace", "excalidraw-block")
								: __("Select", "excalidraw-block")}
						</ToolbarButton>
					</Toolbar>
				</ToolbarGroup>
			</BlockControls>

			{isGalleryVisible && (
				<Modal onRequestClose={() => setIsGalleryVisible(false)}>
					<Gallery
						onSelect={handleDocumentSelected}
						onClose={() => setIsGalleryVisible(false)}
						currentDocId={docId}
					/>
				</Modal>
			)}

			{!docId ? (
				<Selector onSelect={handleSelectDocument} />
			) : (
				<DocContainer docId={docId} />
			)}
		</div>
	);
}
