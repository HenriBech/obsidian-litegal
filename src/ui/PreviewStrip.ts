import { PreviewAspectOptions } from "../types";

/**
 * Manages the preview strip showing thumbnails of all images
 */
export class PreviewStrip {
	private container: HTMLDivElement;
	private track: HTMLDivElement;
	private previewImages: HTMLImageElement[] = [];
	private _activeSlide: number = 0;

	constructor(
		private parent: HTMLElement,
		private images: string[],
		private previewAspect: PreviewAspectOptions,
		private onPreviewClick: (index: number) => void
	) {}

	/**
	 * Render the preview strip
	 */
	render(hidden: boolean = false): void {
		this.container = this.parent.createEl("div", {
			cls: `litegal-preview-outer ${hidden && "hidden"}`,
		});
		this.track = this.container.createEl("div", {
			cls: "litegal-preview",
		});

		this.images.forEach((path, i) => {
			const pImg = this.track.createEl("img", {
				cls: `litegal-preview-img ${
					this.previewAspect === PreviewAspectOptions.square &&
					"litegal-preview-img-square"
				} ${i === this._activeSlide && "litegal-preview-img-active"}`,
			});
			pImg.src = path;
			pImg.onclick = (e) => {
				this.setActiveSlide(i);
				this.onPreviewClick(i);
				e.preventDefault();
			};
			this.previewImages.push(pImg);
		});
	}

	/**
	 * Set the active slide
	 */
	setActiveSlide(index: number): void {
		if (this._activeSlide === index) return;

		this.previewImages[this._activeSlide]?.removeClass(
			"litegal-preview-img-active"
		);
		this.previewImages[index]?.addClass("litegal-preview-img-active");
		this._activeSlide = index;
		this.scrollToActive();
	}

	/**
	 * Scroll to the active preview
	 */
	scrollToActive(smooth: boolean = true): void {
		this.previewImages[this._activeSlide]?.scrollIntoView({
			behavior: smooth ? "smooth" : "auto",
			block: "nearest",
			inline: "center",
		});
	}

	/**
	 * Toggle preview visibility
	 */
	toggle(): void {
		if (this.container.hasClass("hidden")) {
			this.container.removeClass("hidden");
		} else {
			this.container.addClass("hidden");
		}
	}

	/**
	 * Check if preview is hidden
	 */
	isHidden(): boolean {
		return this.container.hasClass("hidden");
	}
}
