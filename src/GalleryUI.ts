export class GalleryUI {
	private activeSlide = 0;
	private scrollSpeed = 0;
	private lightboxEl: HTMLElement;
	private lightboxImg: HTMLImageElement;

	constructor(private container: HTMLElement, private images: string[]) {
		this.render();
		this.createLightbox();
	}

	private render() {
		const gallery = this.container.createEl("div", { cls: "litegal" });

		if (this.images.length === 0) {
			gallery.createEl("p", {
				text: "No images found.",
				cls: "litegal-no-images",
			});
			return;
		}

		// Active Image Section
		const activeContainer = gallery.createEl("div", {
			cls: "litegal-active",
		});
		const img = activeContainer.createEl("img");
		img.src = this.images[this.activeSlide];
		img.onclick = () => this.openLightbox();

		// Navigation Arrows
		this.createArrow(activeContainer, "◄", "left", () =>
			this.updateSlide(-1, img)
		);
		this.createArrow(activeContainer, "►", "right", () =>
			this.updateSlide(1, img)
		);

		// Preview Section
		this.renderPreviews(gallery, img);
	}

	private updateSlide(offset: number, displayImg: HTMLImageElement) {
		this.activeSlide =
			(this.activeSlide + offset + this.images.length) %
			this.images.length;
		displayImg.src = this.images[this.activeSlide];
		if (this.lightboxImg)
			this.lightboxImg.src = this.images[this.activeSlide];
	}

	private renderPreviews(parent: HTMLElement, mainImg: HTMLImageElement) {
		const outer = parent.createEl("div", { cls: "litegal-preview-outer" });
		const previewTrack = outer.createEl("div", { cls: "litegal-preview" });

		this.images.forEach((path, i) => {
			const pImg = previewTrack.createEl("img", {
				cls: "litegal-preview-img",
			});
			pImg.src = path;
			pImg.onclick = () => {
				this.activeSlide = i;
				mainImg.src = path;
			};
		});
	}

	private createArrow(
		parent: HTMLElement,
		text: string,
		side: string,
		clickFn: any,
		hoverFn?: (s: number) => void
	) {
		const arrow = parent.createEl("div", {
			text,
			cls: `litegal-control litegal-arrow litegal-arrow-${side}`,
		});
		if (clickFn) arrow.onclick = clickFn;
		if (hoverFn) {
			arrow.onmouseenter = () => hoverFn(side === "left" ? -5 : 5);
			arrow.onmouseleave = () => hoverFn(0);
		}
	}

	private createLightbox() {
		this.lightboxEl = document.body.createEl("div", {
			cls: "litegal-lightbox-container hidden",
		});
		const content = this.lightboxEl.createEl("div", {
			cls: "litegal-lightbox",
		});

		this.lightboxImg = content.createEl("img", {
			cls: "litegal-lightbox-image",
		});

		this.lightboxEl.onclick = () => this.lightboxEl.addClass("hidden");
		content.onclick = (e) => e.stopPropagation();

		const close = content.createEl("div", {
			text: "✕",
			cls: "litegal-control litegal-lightbox-exit",
		});
		close.onclick = () => this.lightboxEl.addClass("hidden");
	}

	private openLightbox() {
		this.lightboxImg.src = this.images[this.activeSlide];
		this.lightboxEl.removeClass("hidden");
	}
}
