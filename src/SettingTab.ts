import LiteGallery from "../main";
import { App, PluginSettingTab, Setting } from "obsidian";

export enum PreviewLayoutOptions {
	preview = "preview",
	noPreview = "no_preview",
	toggle = "toggle",
}

export enum PaginationIndicatorOptions {
	show = "show",
	hide = "hide",
}

export interface LiteGallerySettings {
	previewLayout: PreviewLayoutOptions;
	paginationIndicator: PaginationIndicatorOptions;
}

export const DEFAULT_SETTINGS: Partial<LiteGallerySettings> = {
	previewLayout: PreviewLayoutOptions.preview,
	paginationIndicator: PaginationIndicatorOptions.show,
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

		new Setting(containerEl)
			.setName("Layout Options")
			.setDesc(
				'These default options can be adjusted for each codeblock. Lines starting with "-" are treated as overrides.'
			)
			.setHeading();

		new Setting(containerEl)
			.setName("Layout: Gallery Preview")
			.setDesc(
				`-preview: ${PreviewLayoutOptions.preview} | ${PreviewLayoutOptions.noPreview} | ${PreviewLayoutOptions.toggle}`
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOption(PreviewLayoutOptions.preview, "Show")
					.addOption(PreviewLayoutOptions.noPreview, "Hide")
					.addOption(
						PreviewLayoutOptions.toggle,
						"Toggle via the slide indicator"
					)
					.setValue(this.plugin.settings.previewLayout)
					.onChange(async (value) => {
						this.plugin.settings.previewLayout =
							value as PreviewLayoutOptions;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Layout: Pagination Indicator")
			.setDesc(
				`-pagination: ${PaginationIndicatorOptions.show} | ${PaginationIndicatorOptions.hide}`
			)
			.addToggle((toggle) =>
				toggle
					.setValue(
						this.plugin.settings.paginationIndicator ===
							PaginationIndicatorOptions.show
					)
					.onChange(async (value) => {
						this.plugin.settings.paginationIndicator = value
							? PaginationIndicatorOptions.show
							: PaginationIndicatorOptions.hide;
						await this.plugin.saveSettings();
					})
			);
	}
}
