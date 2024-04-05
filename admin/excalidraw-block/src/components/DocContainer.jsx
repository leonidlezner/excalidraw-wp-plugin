import { __ } from "@wordpress/i18n";

export default function DocContainer({ doc, showTitle }) {
	return (
		<div className="doc-container">
			<div className="doc" dangerouslySetInnerHTML={{ __html: doc.full }}></div>
			{showTitle && <div className="title">{doc.title}</div>}
		</div>
	);
}
