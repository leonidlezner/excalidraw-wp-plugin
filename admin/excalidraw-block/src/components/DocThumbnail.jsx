import { __ } from "@wordpress/i18n";

export default function DocThumbnail({ doc, onSelect, isSelected }) {
	return (
		<a
			className={"thumbnail" + (isSelected ? " current-thumbnail" : "")}
			href="#"
			onClick={() => onSelect()}
		>
			<div className="image">
				<img src={doc.thumbnail} />
			</div>
			<div className="title">{doc.title}</div>
		</a>
	);
}
