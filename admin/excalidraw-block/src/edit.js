import { __ } from "@wordpress/i18n";

import { useState, useEffect, useRef } from "react";

import {
	BlockControls,
	InspectorControls,
	useBlockProps,
	AlignmentToolbar,
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

export default function Edit({ attributes, setAttributes, isSelected }) {
	const { docId, showTitle, width, alignment } = attributes;
	const [isLoading, setIsLoading] = useState(true);
	const [doc, setDoc] = useState(null);
	const [isGalleryVisible, setIsGalleryVisible] = useState(false);
	const lastSelectedStateRef = useRef(false);

	const handleSelectDocument = () => {
		setIsGalleryVisible(true);
	};

	const handleEdit = () => {
		const newWindow = window.open(
			window.EXCALIDRAW_BLOCK_DATA.editDocUrl + docId,
			"_blank",
		);

		newWindow.focus();
	};

	const handleDocumentSelected = (doc) => {
		setAttributes({
			docId: doc.uuid,
		});

		setIsGalleryVisible(false);
	};

	const abortController =
		typeof AbortController === "undefined" ? undefined : new AbortController();

	const laodDoc = (silentUpdate = false) => {
		const _loadDoc = async () => {
			try {
				//await new Promise((resolve) => setTimeout(resolve, 1000));

				const data = await apiFetch({
					path: "/wp/v1/excalidraw/docs/" + docId,
					signal: abortController?.signal,
				});

				const fetchedDoc = JSON.parse(data);

				if (fetchedDoc?.code == "ok") {
					setDoc(fetchedDoc.data);
				} else {
					setDoc(null);
				}
			} catch (error) {
				if (error.name !== "AbortError") {
				}
			}

			setIsLoading(false);
		};

		if (docId) {
			if (!silentUpdate) {
				setIsLoading(true);
			}

			_loadDoc();
		}
	};

	useEffect(() => {
		laodDoc();

		const handleWindowFocus = () => {
			if (!document.hidden) {
				if (lastSelectedStateRef.current) {
					laodDoc(true);
				}
			}
		};

		document.addEventListener("visibilitychange", handleWindowFocus);

		return () => {
			abortController.abort();
			document.removeEventListener("visibilitychange", handleWindowFocus);
		};
	}, [docId]);

	useEffect(() => {
		lastSelectedStateRef.current = isSelected;
	}, [isSelected]);

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title={__("Document", "excalidraw")}>
					<ToggleControl
						label={__("Show Title", "excalidraw")}
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
					<>
						<ToolbarGroup>
							<AlignmentToolbar
								value={alignment}
								onChange={(newVal) => setAttributes({ alignment: newVal })}
							/>
						</ToolbarGroup>
						<ToolbarGroup>
							<Toolbar label={__("Document", "excalidraw")}>
								<ToolbarButton
									icon={update}
									label={__("Reload", "excalidraw")}
									onClick={() => {
										laodDoc();
									}}
								>
									{__("Reload", "excalidraw")}
								</ToolbarButton>
							</Toolbar>
							<Toolbar>
								<ToolbarButton
									icon={edit}
									label={__("Edit", "excalidraw")}
									onClick={handleEdit}
								>
									{__("Edit", "excalidraw")}
								</ToolbarButton>
							</Toolbar>
						</ToolbarGroup>
					</>
				)}
				<ToolbarGroup>
					<Toolbar>
						<ToolbarButton
							label={__("Replace", "excalidraw")}
							onClick={handleSelectDocument}
							icon={file}
						>
							{docId ? __("Replace", "excalidraw") : __("Select", "excalidraw")}
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
			) : doc ? (
				<DocContainer
					doc={doc}
					resizeControls={isSelected}
					showTitle={showTitle}
					width={width}
					alignment={alignment}
					onSetWidth={(newVal) =>
						setAttributes({
							width: Math.round(newVal),
						})
					}
				/>
			) : (
				<Selector onSelect={handleSelectDocument} notFound={true} />
			)}
		</div>
	);
}
