import {
	PreviewLayoutOptions,
	LiteGallerySettings,
	PaginationIndicatorOptions,
} from "../types";
import { Lightbox } from "./Lightbox";
import { PreviewStrip } from "./PreviewStrip";
import { createArrow, setupKeyboardNavigation } from "./GalleryNavigation";
import { ImageLoader } from "../utils/ImageLoader";

/**
 * Main gallery UI component that orchestrates the display
 */
export class GalleryUI {
	private _activeSlide: number;
	private activeContainer: HTMLDivElement;
	private img: HTMLImageElement;
	private indices: HTMLDivElement[] = [];
	private lightbox: Lightbox;
	private previewStrip?: PreviewStrip;

	constructor(
		private container: HTMLElement,
		private images: string[],
		public settings: LiteGallerySettings,
		private onSlideChange?: (index: number) => void,
		private activeSlideInitial: number = 0,
		private onToggleInfo?: () => void
	) {
		this._activeSlide = this.activeSlideInitial;
		this.lightbox = new Lightbox(
			images,
			settings.paginationIndicator,
			settings.hotkeys as any,
			(index: number) => this.handleLightboxSlideChange(index),
			() => this.focus()
		);
		this.render();
		this.scrollToActive(false);
		if (this.onSlideChange) this.onSlideChange(this._activeSlide);
	}

	/**
	 * Get the current active slide index
	 */
	public get activeSlide(): number {
		return this._activeSlide;
	}

	/**
	 * Set active slide by index
	 */
	public setSlide(index: number): void {
		if (index < 0 || index >= this.images.length) return;
		this.activeSlide = index;
		this.updateActiveImage(index);
	}

	/**
	 * Focus on the gallery
	 */
	public focus(): void {
		this.activeContainer.focus();
	}

	/**
	 * Set the active slide (internal setter with side effects)
	 */
	private set activeSlide(value: number) {
		if (this._activeSlide === value) return;

		this.previewStrip?.setActiveSlide(value);
		this._activeSlide = value;
		this.scrollToActive();
		if (this.onSlideChange) this.onSlideChange(value);
		this.updateIndices();
	}

	/**
	 * Scroll gallery and previews to show active slide
	 */
	private scrollToActive(smooth: boolean = true): void {
		this.previewStrip?.scrollToActive(smooth);
		this.activeContainer?.scrollIntoView({
			behavior: smooth ? "smooth" : "auto",
			block: "start",
			inline: "center",
		});
	}

	/**
	 * Render the gallery UI
	 */
	private async render(): Promise<void> {
		const gallery = this.container.createEl("div", { cls: "litegal" });

		if (this.images.length === 0) {
			gallery.createEl("p", {
				text: "No images found.",
				cls: "litegal-no-images",
			});
			return;
		}

		gallery.style.setProperty(
			"--gallery-height",
			`${this.settings.targetHeightPx}px`
		);

		this.activeContainer = gallery.createEl("div", {
			cls: "litegal-active",
		});

		this.img = this.activeContainer.createEl("img");
		this.img.onclick = (ev) => {
			this.lightbox.open(this.activeSlide);
			ev.preventDefault();
		};
		this.img.addClass(`litegal-aspect-${this.settings.galleryAspect}`);
		
		// Load initial image with loading state
		ImageLoader.loadImmediate(this.img, this.images[this.activeSlide]).then(() => {
			// Preload adjacent images after initial load
			ImageLoader.preloadAdjacent(this.images, this.activeSlide);
		});

		createArrow(this.activeContainer, "❮", "left", () =>
			this.updateSlide(-1)
		);
		createArrow(this.activeContainer, "❯", "right", () =>
			this.updateSlide(1)
		);

		setupKeyboardNavigation(this.activeContainer, {
			onPrevious: () => this.updateSlide(-1),
			onNext: () => this.updateSlide(1),
			onFirst: () => this.setSlide(0),
			onLast: () => this.setSlide(this.images.length - 1),
			onToggleLightbox: () => this.toggleLightbox(),
			onToggleInfo: () => this.onToggleInfo?.(),
		}, this.settings.hotkeys);

		this.focus();

		// Setup preview layout based on settings
		switch (this.settings.previewLayout) {
			case PreviewLayoutOptions.preview:
				this.setupPreviewStrip(gallery, false);
				this.createIndex(this.activeContainer);
				break;
			case PreviewLayoutOptions.toggle:
				this.setupPreviewStrip(gallery, true);
				this.createIndex(this.activeContainer, true);
				break;
			case PreviewLayoutOptions.noPreview:
			default:
				this.createIndex(this.activeContainer);
				break;
		}
	}

	/**
	 * Setup the preview strip
	 */
	private setupPreviewStrip(parent: HTMLElement, hidden: boolean): void {
		this.previewStrip = new PreviewStrip(
			parent,
			this.images,
			this.settings.previewAspect,
			(index) => {
				this.activeSlide = index;
				this.updateActiveImage(index);
				this.focus();
			}
		);
		this.previewStrip.render(hidden);
	}

	/**
	 * Update slide by offset
	 */
	private updateSlide(offset: number): void {
		this.activeSlide =
			(this.activeSlide + offset + this.images.length) %
			this.images.length;
		this.updateActiveImage(this.activeSlide);
	}

	/**
	 * Handle slide change from lightbox
	 */
	private handleLightboxSlideChange(index: number): void {
		this.activeSlide = index;
		this.updateActiveImage(index);
	}

	/**
	 * Update the active image with loading and preloading
	 */
	private updateActiveImage(index: number): void {
		ImageLoader.loadImmediate(this.img, this.images[index]).then(() => {
			// Preload adjacent images
			ImageLoader.preloadAdjacent(this.images, index);
		});
		this.lightbox.setSlide(index);
	} 

	/**
	 * Toggle the lightbox overlay
	 */
	private toggleLightbox(): void {
		if (this.lightbox.isOpen()) {
			this.lightbox.close();
		} else {
			this.lightbox.open(this.activeSlide);
		}
	}

	/**
	 * Toggle preview visibility
	 */
	private togglePreview = (): void => {
		this.previewStrip?.toggle();
	};

	/**
	 * Create pagination index display
	 */
	private createIndex(parent: HTMLElement, toggle: boolean = false): void {
		if (
			this.settings.paginationIndicator === PaginationIndicatorOptions.hide
		) {
			return;
		}
		const index = parent.createEl("div", {
			text: `${this.activeSlide + 1} of ${this.images.length}`,
			cls: `litegal-index ${toggle && "litegal-index-active"}`,
		});
		if (toggle) {
			index.onclick = this.togglePreview;
		}
		this.indices.push(index);
	}

	/**
	 * Update all index displays
	 */
	private updateIndices(): void {
		this.indices.forEach(
			(i) =>
				(i.textContent = `${this.activeSlide + 1} of ${
					this.images.length
				}`)
		);
	}
}
