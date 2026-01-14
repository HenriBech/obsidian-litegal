import { Plugin } from "obsidian";
import { GalleryProcessor } from "./src/GalleryProcessor";
import {
	LiteGallerySettings,
	DEFAULT_SETTINGS,
	LiteGallerySettingTab,
} from "./src/SettingTab";
import { GalleryUI } from "./src/GalleryUI";
import { processCodeBlockSettings } from "src/SettingProcessor";

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

		this.registerMarkdownCodeBlockProcessor("litegal", (source, el, ctx) => {
			var codeBlockSettings: LiteGallerySettings =
				processCodeBlockSettings(source, this.settings);
			const imageList = GalleryProcessor.getImagePaths(
				this.app,
				source,
				ctx.sourcePath
			);
			new GalleryUI(el, imageList, codeBlockSettings);
		});

		// Check if Bases API is available, possibly redundant
		if ((this.app as any).plugins?.getPlugin("bases") || typeof (this as any).registerBasesView === "function") {
			if (typeof (this as any).registerBasesView === "function") {
				(this as any).registerBasesView("litegal-bases-view", {
					name: "Lite Gallery",
					icon: "image-file",
					factory: (controller: any, containerEl: HTMLElement) => {
						const { LiteGalleryBasesView } = require("./src/BasesGalleryView");
						return new LiteGalleryBasesView(controller, containerEl);
					}
				});
			}
		}
	}
}
