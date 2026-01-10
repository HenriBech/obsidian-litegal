import { Plugin } from "obsidian";
import { GalleryProcessor } from "./src/GalleryProcessor";
import {
	LiteGallerySettings,
	DEFAULT_SETTINGS,
	LiteGallerySettingTab,
} from "./src/SettingTab";
import { GalleryUI } from "./src/GalleryUI";

import "styles.css";

export default class LiteGallery extends Plugin {
	settings: LiteGallerySettings;

	async load_settings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async save_settings() {
		await this.saveData(this.settings);
	}

	async onload() {
		await this.load_settings();

		this.addSettingTab(new LiteGallerySettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor("litegal", (source, el, _) => {
			const imageList = GalleryProcessor.getImagePaths(this.app, source);
			new GalleryUI(el, imageList);
		});
	}
}
