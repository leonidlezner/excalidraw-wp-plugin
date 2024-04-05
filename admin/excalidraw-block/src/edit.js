import { __ } from "@wordpress/i18n";

import { useState, useEffect } from "react";

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
	Spinner,
	TextControl,
	ToggleControl,
} from "@wordpress/components";

import { edit, file, update } from "@wordpress/icons";

import "./editor.scss";
import Selector from "./components/Placeholder";
import DocContainer from "./components/DocContainer";
import Gallery from "./components/Gallery";
import apiFetch from "@wordpress/api-fetch";

export default function Edit({ attributes, setAttributes }) {
	const { docId, showTitle } = attributes;
	const [isLoading, setIsLoading] = useState(true);
	const [doc, setDoc] = useState(null);
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

	const abortController =
		typeof AbortController === "undefined" ? undefined : new AbortController();

	const laodDoc = () => {
		const _loadDoc = async () => {
			try {
				//await new Promise((resolve) => setTimeout(resolve, 1000));

				const data = await apiFetch({
					path: "/wp/v1/excalidraw/docs/" + docId,
					signal: abortController?.signal,
				});

				const fetchedDoc = JSON.parse(data);

				setDoc(fetchedDoc);
			} catch (error) {
				if (error.name !== "AbortError") {
					console.error(error);
				}
			}

			setIsLoading(false);
		};

		if (docId) {
			setIsLoading(true);
			_loadDoc();
		}
	};

	useEffect(() => {
		laodDoc();

		return () => {
			abortController.abort();
		};
	}, [docId]);

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title={__("Document", "excalidraw-block")}>
					<ToggleControl
						label={__("Show Title", "excalidraw-block")}
						checked={showTitle}
						onChange={(isChecked) =>
							setAttributes({
								showTitle: isChecked,
							})
						}
					/>
				</PanelBody>
			</InspectorControls>

			<BlockControls>
				{docId !== undefined && (
					<ToolbarGroup>
						<Toolbar>
							<ToolbarButton
								icon={update}
								label={__("Reload", "excalidraw-block")}
								onClick={() => {
									laodDoc();
								}}
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
			) : isLoading ? (
				<div className="spinner-container">
					<Spinner
						style={{
							height: "calc(4px * 10)",
							width: "calc(4px * 10)",
						}}
					/>
				</div>
			) : (
				<DocContainer doc={doc} showTitle={showTitle} />
			)}
		</div>
	);
}
