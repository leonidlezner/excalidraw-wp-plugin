import { __ } from "@wordpress/i18n";

export default function DocContainer({ docId }) {
	return (
		<div>
			<div>{docId}</div>
		</div>
	);
}