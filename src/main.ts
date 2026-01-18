import { Plugin, Editor } from "obsidian";
import { GalleryProcessor } from "./processors/GalleryProcessor";
import {
	LiteGallerySettings,
	DEFAULT_SETTINGS,
} from "./types";
import { LiteGallerySettingTab } from "./settings/SettingTab";
import { GalleryUI } from "./ui/GalleryUI";
import { processCodeBlockSettings } from "./settings/SettingProcessor";

import "./styles.css";

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

		this.addCommand({
			id: "insert-litegal-codeblock",
			name: "Insert gallery code block",
			editorCallback: (editor: Editor) => {
				editor.replaceSelection("```litegal\n\n```");
				const cursor = editor.getCursor();
				editor.setCursor(cursor.line - 1, 0);
			},
		});

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
						const { LiteGalleryBasesView } = require("./gallery/BasesGalleryView");
						return new LiteGalleryBasesView(controller, containerEl);
					},
					options: () => [
						{
							key: "show-referenced-images",
							type: "toggle",
							displayName: "Also show linked images",
							default: false
						}
					]
				});
			}
		}
	}
}
