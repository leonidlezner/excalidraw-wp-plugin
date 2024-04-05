import { __ } from "@wordpress/i18n";
import { ResizableBox } from "@wordpress/components";
import { useRef } from "react";

export default function DocContainer({
	doc,
	showTitle,
	width,
	onSetWidth,
	resizeControls,
	alignment,
}) {
	const containerRef = useRef();

	const handleResizeStop = (event, direction, elt, delta) => {
		if (containerRef.current) {
			const newRelaiveWidth =
				(elt.offsetWidth / containerRef.current.offsetWidth) * 100;

			onSetWidth(newRelaiveWidth);
		}
	};

	const DocWidget = () => {
		return (
			<div
				className="content"
				dangerouslySetInnerHTML={{ __html: doc.full }}
			></div>
		);
	};

	return (
		<div className="doc-container">
			<div
				className="doc"
				ref={containerRef}
				style={{ justifyContent: alignment }}
			>
				{resizeControls ? (
					<ResizableBox
						minWidth="20%"
						maxWidth="100%"
						lockAspectRatio={true}
						onResizeStop={handleResizeStop}
						size={{ width: width + "%" }}
					>
						<DocWidget />
					</ResizableBox>
				) : (
					<div style={{ width: width + "%" }}>
						<DocWidget />
					</div>
				)}
			</div>
			{showTitle && <div className="title">{doc.title}</div>}
		</div>
	);
}
