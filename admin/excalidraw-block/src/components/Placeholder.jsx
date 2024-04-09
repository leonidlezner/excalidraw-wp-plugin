import { __ } from "@wordpress/i18n";
import { Button } from "@wordpress/components";

export default function Selector({ onSelect, notFound = false }) {
	return (
		<div className="selector">
			{notFound && (
				<div className="error">{__("Document not found", "excalidraw")}</div>
			)}
			<div className="message">
				{__("Please select an Excalidraw drawing", "excalidraw")}
			</div>
			<div className="action">
				<Button variant="primary" onClick={onSelect}>
					{__("Select document", "excalidraw")}
				</Button>
				<Button
					variant="secondary"
					onClick={() => {
						window.open(window.EXCALIDRAW_BLOCK_DATA.newDocUrl, "_blank");
					}}
				>
					{__("Create new drawing", "excalidraw")}
				</Button>
			</div>
		</div>
	);
}
