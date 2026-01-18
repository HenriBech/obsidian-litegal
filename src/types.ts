export enum PreviewLayoutOptions {
	preview = "preview",
	noPreview = "no-preview",
	toggle = "toggle",
}

export enum PaginationIndicatorOptions {
	show = "show",
	hide = "hide",
}

export enum PreviewAspectOptions {
	square = "square",
	fitToHeight = "fit-to-height",
}

export enum GalleryAspectOptions {
	contain = "contain",
	cover = "cover",
	fitToWidth = "fit-to-width",
	fitToHeight = "fit-to-height",
	stretch = "stretch",
}

export interface LiteGallerySettings {
	paginationIndicator: PaginationIndicatorOptions;
	previewLayout: PreviewLayoutOptions;
	previewAspect: PreviewAspectOptions;
	galleryAspect: GalleryAspectOptions;
	targetHeightPx: number;
	hotkeys: {
		previous: string;
		next: string;
		first: string;
		last: string;
		escape: string;
		toggleLightbox: string;
		toggleInfo: string;
	};
}

export const DEFAULT_SETTINGS: Partial<LiteGallerySettings> = {
	paginationIndicator: PaginationIndicatorOptions.show,
	previewLayout: PreviewLayoutOptions.preview,
	previewAspect: PreviewAspectOptions.square,
	galleryAspect: GalleryAspectOptions.fitToHeight,
	targetHeightPx: 500,
	hotkeys: {
		previous: "ArrowLeft",
		next: "ArrowRight",
		first: "ArrowDown",
		last: "ArrowUp",
		escape: "Escape",
		toggleLightbox: " ",
		toggleInfo: "i",
	},
};

// Re-export ImageLoadState for convenience
export { ImageLoadState } from "./utils/ImageLoader";
