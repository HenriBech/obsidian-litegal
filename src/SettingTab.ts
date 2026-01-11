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

export enum PreviewAspectOptions {
	square = "square",
	fitToHeight = "fit_to_height",
}

export enum GalleryAspectOptions {
	contain = "contain",
	cover = "cover",
	fitToWidth = "fit_to_width",
	fitToHeight = "fit_to_height",
	stretch = "stretch",
}

export interface LiteGallerySettings {
	previewLayout: PreviewLayoutOptions;
	paginationIndicator: PaginationIndicatorOptions;
	previewAspect: PreviewAspectOptions;
	galleryAspect: GalleryAspectOptions;
}

export const DEFAULT_SETTINGS: Partial<LiteGallerySettings> = {
	previewLayout: PreviewLayoutOptions.preview,
	paginationIndicator: PaginationIndicatorOptions.show,
	previewAspect: PreviewAspectOptions.square,
	galleryAspect: GalleryAspectOptions.contain,
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
			.setName("Layout: Preview Fit")
			.setDesc(
				`-preview_fit: ${PreviewAspectOptions.square} | ${PreviewAspectOptions.fitToHeight}`
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOption(PreviewAspectOptions.square, "Square")
					.addOption(
						PreviewAspectOptions.fitToHeight,
						"Fit-to-Height"
					)
					.setValue(this.plugin.settings.previewAspect)
					.onChange(async (value) => {
						this.plugin.settings.previewAspect =
							value as PreviewAspectOptions;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Layout: Gallery Fit")
			.setDesc(
				`-gallery_fit: ${GalleryAspectOptions.contain} | ${GalleryAspectOptions.cover} | ${GalleryAspectOptions.fitToWidth} | ${GalleryAspectOptions.fitToHeight} | ${GalleryAspectOptions.stretch}`
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOption(GalleryAspectOptions.contain, "Contain")
					.addOption(GalleryAspectOptions.cover, "Cover")
					.addOption(GalleryAspectOptions.fitToWidth, "Fit-to-Width")
					.addOption(
						GalleryAspectOptions.fitToHeight,
						"Fit-to-Height"
					)
					.addOption(GalleryAspectOptions.stretch, "Stretch")
					.setValue(this.plugin.settings.galleryAspect)
					.onChange(async (value) => {
						this.plugin.settings.galleryAspect =
							value as GalleryAspectOptions;
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
