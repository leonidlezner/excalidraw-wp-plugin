/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from "@wordpress/blocks";

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import "./style.scss";

/**
 * Internal dependencies
 */
import Edit from "./edit";
import metadata from "./block.json";

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType(metadata.name, {
	/**
	 * @see ./edit.js
	 */
	edit: Edit,
	icon: {
		src: (
			<svg
				clip-rule="evenodd"
				fill-rule="evenodd"
				stroke-linecap="round"
				version="1.1"
				viewBox="0 0 75 74"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="m3.756 58.856 13.867 12.64 50.085-46.561 4.279-22.323-24.126 3.549-44.591 51.876 0.486 0.819zm52.647-43.748c2.298 0 4.164 1.866 4.164 4.165 0 2.298-1.866 4.164-4.164 4.164-2.299 0-4.165-1.866-4.165-4.164-0-2.299 1.866-4.165 4.165-4.165z"
					fill="#000"
				/>
				<path
					d="m3.176 57.472c2.92 2.81 6.001 6.547 13.075 13.205m-12.935-12.25c3.897 3.052 8.669 7.179 14.145 12.297m-0.776 0.371c13.358-11.79 26.164-24.118 49.751-45.772m-49.357 45.606c11.592-10.598 21.97-20.751 50.042-45.58m0.675-0.201c0.949-5.689 1.655-12.187 2.979-22.992m-3.984 23.152c1.473-7.822 3.449-15.539 4.07-22.239m0.013-0.011c-4.792 0.298-11.344 1.43-23.397 3.968m23.897-3.78c-7.55-0.044-15.685 1.727-23.779 3.155m-0.325-0.746c-15.752 19.564-30.728 37.783-44.256 52.155m44.719-51.368c-14.997 17.445-29.276 34.148-43.971 51.944"
					fill="none"
					stroke="#000"
					stroke-width=".22px"
				/>
				<g fill="#000" stroke="#000">
					<path
						d="m58.282 41.238-14.46 14.154 18.091 16.164 9.824-11.732-14.743-18.077"
						stroke-linecap="butt"
						stroke-linejoin="round"
						stroke-miterlimit="2"
						stroke-width=".11px"
					/>
					<path
						d="m57.294 41.281c-4.195 4.553-8.959 8.092-13.695 13.294m13.542-12.936c-4.816 5.353-9.916 10.313-13.802 13.127m0.375 0.703c6.17 3.969 11.352 9.94 18.081 14.78m-17.894-15.459c5.886 4.971 13.093 11.234 18.446 15.672m0.41 0.652c2.842-4.553 6.027-8.868 10.086-11.359m-10.597 11.318c3.493-3.298 5.87-6.833 9.875-11.029m0.709-0.742c-5.646-5.577-10.308-10.553-15.094-18.142m14.861 18.295c-3.744-2.866-6.601-6.811-14.831-17.859"
						stroke-width=".22px"
					/>
				</g>
				<g fill="#000" stroke="#000">
					<path
						d="m33.56 17.503-13.503 16.464-11.844-8.76-5.903-22.082 19.397 5.016 10.265 8.722"
						stroke-linecap="butt"
						stroke-linejoin="round"
						stroke-miterlimit="2"
						stroke-width=".11px"
					/>
					<path
						d="m32.6 17.952c-3.755 3.271-5.918 6.741-12.588 15.888m12.989-16.201c-5.144 6.108-10.764 12.174-13.537 16.408m0.207-0.153c-5.247-2.431-9.414-6.662-11.266-8.551m10.578 8.611c-3.86-2.773-8.594-6.951-10.755-8.236m-0.416-0.811c-2.099-7.134-2.791-13.177-5.213-22.004m5.584 22.718c-2.222-7.852-3.951-15.454-5.454-22.621m-0.572-2e-3c6.509 2.603 13.056 2.424 19.52 4.798m-19.404-4.276c7.605 1.807 15.161 2.933 20.534 3.811m0.155 0.724c0.789 1.066 3.888 2.931 10.382 9.875m-10.568-10.414c3.781 3.977 7.43 7.19 10.382 9.808"
						stroke-width=".22px"
					/>
				</g>
			</svg>
		),
	},
});
