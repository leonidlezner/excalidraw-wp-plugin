import { __ } from "@wordpress/i18n";
import { Spinner, Button } from "@wordpress/components";
import { useEffect, useState } from "react";
import apiFetch from "@wordpress/api-fetch";
import DocThumbnail from "./DocThumbnail";

export default function Gallery({ onSelect, onClose, currentDocId }) {
	const [isLoading, setIsLoading] = useState(false);

	const [docs, setDocs] = useState([]);

	const abortController =
		typeof AbortController === "undefined" ? undefined : new AbortController();

	useEffect(() => {
		const _loadDocs = async () => {
			try {
				const data = await apiFetch({
					path: "/wp/v1/excalidraw/docs",
					signal: abortController?.signal,
					parse: true,
				});

				const fetchedDocs = JSON.parse(data);

				setDocs(fetchedDocs);
			} catch (error) {
				if (error.name !== "AbortError") {
					console.error(error);
				}
			}

			//await new Promise((resolve) => setTimeout(resolve, 1000));

			setIsLoading(false);
		};

		setIsLoading(true);
		_loadDocs();

		return () => {
			abortController.abort();
		};
	}, []);

	return (
		<div className="excalidraw-block-gallery">
			{isLoading ? (
				<div className="spinner-container">
					<Spinner
						style={{
							height: "calc(4px * 10)",
							width: "calc(4px * 10)",
						}}
					/>
				</div>
			) : docs.length > 0 ? (
				<div className="gallery-grid">
					{docs.map((doc) => (
						<DocThumbnail
							doc={doc}
							onSelect={() => onSelect(doc)}
							isSelected={currentDocId === doc.uuid}
						/>
					))}
				</div>
			) : (
				<div className="not-found">
					<div>{__("Do Excalidraw documents found!", "excalidraw-block")}</div>
					<a
						href={window.EXCALIDRAW_BLOCK_DATA.newDocUrl}
						target="_blank"
						onClick={() => onClose()}
					>
						{__("Create new drawing", "excalidraw-block")}
					</a>
				</div>
			)}
		</div>
	);
}
