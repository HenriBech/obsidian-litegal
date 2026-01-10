export class GalleryUI {
	private _activeSlide = 0;
	private lightboxEl: HTMLElement;
	private lightboxImg: HTMLImageElement;
	private activeContainer: HTMLDivElement;
	private img: HTMLImageElement;
	private indices: HTMLDivElement[] = [];

	constructor(private container: HTMLElement, private images: string[]) {
		this.render();
		this.createLightbox();
	}

	get activeSlide(): number {
		return this._activeSlide;
	}

	set activeSlide(value) {
		if (this._activeSlide === value) return;
		this._activeSlide = value;
		this.indices.forEach(
			(i) =>
				(i.textContent = `${this.activeSlide + 1} of ${
					this.images.length
				}`)
		);
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

		this.activeContainer = gallery.createEl("div", {
			cls: "litegal-active",
		});

		this.createIndex(this.activeContainer);

		this.img = this.activeContainer.createEl("img");
		this.img.src = this.images[this.activeSlide];
		this.img.onclick = () => this.openLightbox();

		this.createArrow(this.activeContainer, "➜", "left", () =>
			this.updateSlide(-1, this.img)
		);
		this.createArrow(this.activeContainer, "➜", "right", () =>
			this.updateSlide(1, this.img)
		);

		this.activeContainer.tabIndex = 0;
		this.activeContainer.focus();
		this.activeContainer.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") {
				this.updateSlide(-1, this.img);
				e.preventDefault();
			} else if (e.key === "ArrowRight") {
				this.updateSlide(1, this.img);
				e.preventDefault();
			} else if (e.key === "ArrowDown") {
				this.updateSlide(-this.activeSlide, this.img);
				e.preventDefault();
			} else if (e.key === "ArrowUp") {
				this.updateSlide(
					this.images.length - this.activeSlide - 1,
					this.img
				);
				e.preventDefault();
			}
		});

		this.renderPreviews(gallery, this.img);
	}

	private updateSlide(offset: number, displayImg: HTMLImageElement) {
		this.activeSlide =
			(this.activeSlide + offset + this.images.length) %
			this.images.length;
		displayImg.src = this.images[this.activeSlide];
		if (this.lightboxImg)
			this.lightboxImg.src = this.images[this.activeSlide];
	}

	private createIndex = (parent: HTMLElement) => {
		const index = parent.createEl("div", {
			text: `${this.activeSlide + 1} of ${this.images.length}`,
			cls: "litegal-index",
		});
		this.indices.push(index);
	};

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
				this.activeContainer.focus();
			};
		});
	}

	private createArrow(
		parent: HTMLElement,
		text: string,
		side: string,
		clickFn: any
	) {
		const arrow = parent.createEl("div", {
			text,
			cls: `litegal-control litegal-arrow litegal-arrow-${side}`,
		});
		if (clickFn) arrow.onclick = clickFn;
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

		this.lightboxEl.onclick = () => this.closeLightbox();
		content.onclick = (e) => e.stopPropagation();

		this.createIndex(content);
		this.createArrow(content, "➜", "left", () =>
			this.updateSlide(-1, this.img)
		);
		this.createArrow(content, "➜", "right", () =>
			this.updateSlide(1, this.img)
		);

		const close = content.createEl("div", {
			text: "✕",
			cls: "litegal-control litegal-lightbox-exit",
		});
		close.onclick = () => this.closeLightbox();
	}

	private openLightbox() {
		this.lightboxImg.src = this.images[this.activeSlide];
		this.lightboxEl.removeClass("hidden");
	}

	private closeLightbox() {
		this.lightboxEl.addClass("hidden");
		this.activeContainer.focus();
	}
}
