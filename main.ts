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

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new LiteGallerySettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor("litegal", (source, el, _) => {
			var codeBlockSettings: LiteGallerySettings = this.settings;
			const imageList = GalleryProcessor.getImagePaths(this.app, source);
			new GalleryUI(el, imageList, codeBlockSettings);
		});
	}
}
