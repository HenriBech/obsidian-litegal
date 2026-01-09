import { Plugin } from "obsidian";
import { GalleryProcessor } from "./src/GalleryProcessor";
import { GalleryUI } from "./src/GalleryUI";

import "styles.css";

export default class LiteGallery extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor(
			"litegal",
			(source, el, ctx) => {
				const imageList = GalleryProcessor.getImagePaths(
					this.app,
					source
				);
				new GalleryUI(el, imageList);
			}
		);
	}
}
