import {
	PreviewLayoutOptions,
	LiteGallerySettings,
	PaginationIndicatorOptions,
} from "./SettingTab";

export class GalleryUI {
	private _activeSlide = 0;
	private lightboxEl: HTMLElement;
	private lightboxImg: HTMLImageElement;
	private activeContainer: HTMLDivElement;
	private previewContainer: HTMLDivElement;
	private img: HTMLImageElement;
	private indices: HTMLDivElement[] = [];

	constructor(
		private container: HTMLElement,
		private images: string[],
		public settings: LiteGallerySettings
	) {
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

		this.img = this.activeContainer.createEl("img");
		this.img.src = this.images[this.activeSlide];
		this.img.onclick = () => this.openLightbox();

		this.createArrow(this.activeContainer, "➜", "left", () =>
			this.updateSlide(-1, this.img)
		);
		this.createArrow(this.activeContainer, "➜", "right", () =>
			this.updateSlide(1, this.img)
		);

		this.attatchKeyboardNav(this.activeContainer);
		this.activeContainer.focus();

		switch (this.settings.previewLayout) {
			case PreviewLayoutOptions.preview:
				this.renderPreviews(gallery, this.img);
				this.createIndex(this.activeContainer);
				break;
			case PreviewLayoutOptions.toggle:
				this.renderPreviews(gallery, this.img, true);
				this.createIndex(this.activeContainer, true);
				break;
			case PreviewLayoutOptions.noPreview:
			default:
				this.createIndex(this.activeContainer);
				break;
		}
	}

	private updateSlide(offset: number, displayImg: HTMLImageElement) {
		this.activeSlide =
			(this.activeSlide + offset + this.images.length) %
			this.images.length;
		displayImg.src = this.images[this.activeSlide];
		if (this.lightboxImg)
			this.lightboxImg.src = this.images[this.activeSlide];
	}

	private togglePreview = () => {
		if (this.previewContainer.hasClass("hidden")) {
			this.previewContainer.removeClass("hidden");
		} else {
			this.previewContainer.addClass("hidden");
		}
	};

	private createIndex = (parent: HTMLElement, toggle = false) => {
		if (
			this.settings.paginationIndicator == PaginationIndicatorOptions.hide
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
	};

	private renderPreviews(
		parent: HTMLElement,
		mainImg: HTMLImageElement,
		hidden: boolean = false
	) {
		this.previewContainer = parent.createEl("div", {
			cls: `litegal-preview-outer ${hidden && "hidden"}`,
		});
		const previewTrack = this.previewContainer.createEl("div", {
			cls: "litegal-preview",
		});

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

	private attatchKeyboardNav(parent: HTMLElement) {
		parent.tabIndex = 0;
		parent.addEventListener("keydown", (e: KeyboardEvent) => {
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

		this.attatchKeyboardNav(this.lightboxEl);
		this.lightboxEl.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				this.closeLightbox();
				e.preventDefault();
			}
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
		this.lightboxEl.focus();
	}

	private closeLightbox() {
		this.lightboxEl.addClass("hidden");
		this.activeContainer.focus();
	}
}
