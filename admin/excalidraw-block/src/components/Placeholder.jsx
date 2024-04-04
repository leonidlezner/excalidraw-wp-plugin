import { __ } from "@wordpress/i18n";
import { Button } from "@wordpress/components";

export default function Selector({ onSelect }) {
	return (
		<div className="selector">
			<div className="message">
				{__("Please select an Excalidraw drawing", "excalidraw-block")}
			</div>
			<div className="action">
				<Button variant="primary" onClick={onSelect}>
					{__("Select document", "excalidraw-block")}
				</Button>
			</div>
		</div>
	);
}
