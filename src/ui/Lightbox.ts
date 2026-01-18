import { createArrow, setupKeyboardNavigation } from "./GalleryNavigation";
import { PaginationIndicatorOptions } from "../types";

/**
 * Manages the lightbox overlay for full-screen image viewing
 */
export class Lightbox {
	private containerEl: HTMLElement;
	private lightboxImg: HTMLImageElement;
	private indices: HTMLDivElement[] = [];
	private _activeSlide: number = 0;

	constructor(
		private images: string[],
		private paginationIndicator: PaginationIndicatorOptions,
		private hotkeys: { [key: string]: string },
		private onSlideChange?: (index: number) => void,
		private onLightboxClose?: () => void,
	) {
		this.createLightbox();
	}

	/**
	 * Get current active slide index
	 */
	get activeSlide(): number {
		return this._activeSlide;
	}

	/**
	 * Open the lightbox at a specific slide
	 */
	open(slideIndex: number = 0): void {
		this._activeSlide = slideIndex;
		this.lightboxImg.src = this.images[this._activeSlide];
		this.updateIndexDisplay();
		this.containerEl.removeClass("hidden");
		this.containerEl.focus();
	}

	/**
	 * Close the lightbox
	 */
	close(): void {
		this.containerEl.addClass("hidden");
		if (this.onLightboxClose) {
			this.onLightboxClose();
		}
	}

	/**
	 * Check if lightbox is currently open
	 */
	isOpen(): boolean {
		return !this.containerEl.hasClass("hidden");
	}

	/**
	 * Update slide by offset
	 */
	updateSlide(offset: number): void {
		this._activeSlide =
			(this._activeSlide + offset + this.images.length) %
			this.images.length;
		this.lightboxImg.src = this.images[this._activeSlide];
		this.updateIndexDisplay();
		if (this.onSlideChange) {
			this.onSlideChange(this._activeSlide);
		}
	}

	/**
	 * Set slide to specific index
	 */
	setSlide(index: number): void {
		if (index < 0 || index >= this.images.length) return;
		this._activeSlide = index;
		this.lightboxImg.src = this.images[this._activeSlide];
		this.updateIndexDisplay();
	}

	/**
	 * Create the lightbox DOM structure
	 */
	private createLightbox(): void {
		this.containerEl = document.body.createEl("div", {
			cls: "litegal-lightbox-container hidden",
		});
		const content = this.containerEl.createEl("div", {
			cls: "litegal-lightbox",
		});

		this.lightboxImg = content.createEl("img", {
			cls: "litegal-lightbox-image",
		});

		setupKeyboardNavigation(this.containerEl, {
			onPrevious: () => this.updateSlide(-1),
			onNext: () => this.updateSlide(1),
			onFirst: () => this.setSlide(0),
			onLast: () => this.setSlide(this.images.length - 1),
			onEscape: () => this.close(),
			onToggleLightbox: () => this.close(),
		}, this.hotkeys);

		this.containerEl.onclick = () => this.close();
		content.onclick = (e) => e.stopPropagation();

		this.createIndex(content);
		createArrow(content, "❮", "left", () => this.updateSlide(-1));
		createArrow(content, "❯", "right", () => this.updateSlide(1));

		const close = content.createEl("div", {
			text: "✕",
			cls: "litegal-control litegal-lightbox-exit",
		});
		close.onclick = () => this.close();
	}

	/**
	 * Create the pagination index display
	 */
	private createIndex(parent: HTMLElement): void {
		if (this.paginationIndicator === PaginationIndicatorOptions.hide) {
			return;
		}
		const index = parent.createEl("div", {
			text: `${this._activeSlide + 1} of ${this.images.length}`,
			cls: "litegal-index",
		});
		this.indices.push(index);
	}

	/**
	 * Update the index display
	 */
	private updateIndexDisplay(): void {
		this.indices.forEach(
			(i) =>
				(i.textContent = `${this._activeSlide + 1} of ${
					this.images.length
				}`)
		);
	}
}
