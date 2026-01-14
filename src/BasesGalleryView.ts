import {
	BasesView,
	QueryController,
	TFile,
} from "obsidian";
import { GalleryUI } from "./GalleryUI";
import { LiteGallerySettings, DEFAULT_SETTINGS, GalleryAspectOptions, PreviewAspectOptions } from "./SettingTab";
import { GalleryProcessor } from "./GalleryProcessor";

export class LiteGalleryBasesView extends BasesView {
	type = "litegal-bases-view";
	containerEl: HTMLElement;
	resizeObserver: ResizeObserver;

	constructor(controller: QueryController, containerEl: HTMLElement) {
		super(controller);
		this.containerEl = containerEl;
	}

	onload() {
		this.containerEl.style.overflow = "hidden";
		this.resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const height = entry.contentRect.height - 80;
				this.updateHeight(height);
			}
		});
		this.resizeObserver.observe(this.containerEl);
	}

	onunload() {
		this.resizeObserver.disconnect();
	}

	updateHeight(height: number) {
		const gallery = this.containerEl.querySelector(".litegal") as HTMLElement;
		if (gallery) {
			gallery.style.setProperty("--gallery-height", `${height}px`);
		}
	}

	onDataUpdated(): void {
		const container = this.containerEl;
		container.empty();

		const images: string[] = [];
		const seenImages = new Set<string>();

		if (this.data && this.data.data) {
			for (const entry of this.data.data) {
				if (entry.file instanceof TFile && this.isImage(entry.file.extension)) {
					const path = this.app.vault.getResourcePath(entry.file);
					if (!seenImages.has(path)) {
						images.push(path);
						seenImages.add(path);
					}
					continue;
				}

				if (this.allProperties) {
					for (const propId of this.allProperties) {
						const val = entry.getValue(propId);
						if (val) {
							const strVal = val.toString();
							if (this.isLikelyImage(strVal)) {
								const path = GalleryProcessor.processImageLine(
									this.app,
									strVal,
									entry.file.path
								);
								if (path && !seenImages.has(path)) {
									images.push(path);
									seenImages.add(path);
								}
							}
						}
					}
				}
			}
		}

		const settings: LiteGallerySettings = { 
			...DEFAULT_SETTINGS, 
			galleryAspect: GalleryAspectOptions.contain,
            previewAspect: PreviewAspectOptions.fitToHeight,
			targetHeightPx: this.containerEl.clientHeight - 140,
		} as LiteGallerySettings;
		
		if (images.length > 0) {
			new GalleryUI(container, images, settings);
		} else {
			container.createEl("div", { 
				text: "No images found in this view.",
				cls: "litegal-no-images" 
			});
		}
	}

	private isImage(ext: string) {
		return ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"].includes(ext.toLowerCase());
	}

	private isLikelyImage(val: string) {
		return val.match(/\.(png|jpg|jpeg|gif|bmp|svg|webp)($|\?|\])/i);
	}
}
