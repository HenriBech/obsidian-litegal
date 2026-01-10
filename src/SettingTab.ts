import LiteGallery from "../main";
import { App, PluginSettingTab, Setting } from "obsidian";

export enum PreviewLayoutOptions {
	preview = "preview",
	noPreview = "no_preview",
	toggle = "toggle",
}

export interface LiteGallerySettings {
	previewLayout: PreviewLayoutOptions;
}

export const DEFAULT_SETTINGS: Partial<LiteGallerySettings> = {
	previewLayout: PreviewLayoutOptions.preview,
};

export class LiteGallerySettingTab extends PluginSettingTab {
	plugin: LiteGallery;

	constructor(app: App, plugin: LiteGallery) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", {
			text: "Default Values",
		});

		new Setting(containerEl)
			.setName("Layout: Show Preview")
			.addDropdown((dropdown) =>
				dropdown
					.addOption(PreviewLayoutOptions.preview, "Show preview")
					.addOption(PreviewLayoutOptions.noPreview, "Hide preview")
					.addOption(
						PreviewLayoutOptions.toggle,
						"Toggle preview via the slide indicator"
					)
					.setValue(this.plugin.settings.previewLayout)
					.onChange(async (value) => {
						this.plugin.settings.previewLayout =
							value as PreviewLayoutOptions;
						await this.plugin.saveSettings();
					})
			);
	}
}
