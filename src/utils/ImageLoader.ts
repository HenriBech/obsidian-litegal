/**
 * ImageLoader - Handles lazy loading, preloading, and error handling for images
 */

export enum ImageLoadState {
	IDLE = "idle",
	LOADING = "loading",
	LOADED = "loaded",
	ERROR = "error",
}

export interface ImageLoadResult {
	src: string;
	state: ImageLoadState;
	error?: Error;
}

export class ImageLoader {
	private static loadingCache = new Map<string, Promise<ImageLoadResult>>();
	private static loadedImages = new Set<string>();
	private static observer: IntersectionObserver | null = null;

	/**
	 * Initialize the intersection observer for lazy loading
	 */
	private static getObserver(): IntersectionObserver {
		if (!this.observer) {
			this.observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const img = entry.target as HTMLImageElement;
							const src = img.dataset.src;
							if (src) {
								this.loadImage(src).then((result) => {
									if (result.state === ImageLoadState.LOADED) {
										img.src = src;
										img.removeAttribute("data-src");
										img.removeClass("litegal-loading");
									} else if (result.state === ImageLoadState.ERROR) {
										img.addClass("litegal-image-error");
										img.alt = "Failed to load image";
									}
								});
								this.observer?.unobserve(img);
							}
						}
					});
				},
				{
					rootMargin: "50px", // Start loading 50px before image is visible
					threshold: 0.01,
				}
			);
		}
		return this.observer;
	}

	/**
	 * Load an image with caching and error handling
	 */
	static async loadImage(src: string): Promise<ImageLoadResult> {
		// Return cached result if available
		if (this.loadedImages.has(src)) {
			return { src, state: ImageLoadState.LOADED };
		}

		// Return existing promise if already loading
		if (this.loadingCache.has(src)) {
			return this.loadingCache.get(src)!;
		}

		// Create new loading promise
		const loadPromise = new Promise<ImageLoadResult>((resolve) => {
			const img = new Image();

			const onLoad = () => {
				this.loadedImages.add(src);
				this.loadingCache.delete(src);
				resolve({ src, state: ImageLoadState.LOADED });
			};

			const onError = () => {
				this.loadingCache.delete(src);
				const error = new Error(`Failed to load image: ${src}`);
				console.error("ImageLoader:", error);
				resolve({ src, state: ImageLoadState.ERROR, error });
			};

			img.addEventListener("load", onLoad);
			img.addEventListener("error", onError);
			img.src = src;
		});

		this.loadingCache.set(src, loadPromise);
		return loadPromise;
	}

	/**
	 * Setup lazy loading for an image element
	 */
	static setupLazyLoad(img: HTMLImageElement, src: string): void {
		img.dataset.src = src;
		img.addClass("litegal-loading");
		
		// Use a placeholder/skeleton
		img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
		
		this.getObserver().observe(img);
	}

	/**
	 * Immediately load an image (for active slide)
	 */
	static async loadImmediate(
		img: HTMLImageElement,
		src: string
	): Promise<ImageLoadResult> {
		img.addClass("litegal-loading");

		const result = await this.loadImage(src);

		if (result.state === ImageLoadState.LOADED) {
			img.src = src;
			img.removeClass("litegal-loading");
		} else if (result.state === ImageLoadState.ERROR) {
			img.addClass("litegal-image-error");
			img.removeClass("litegal-loading");
			img.alt = "Failed to load image";
		}

		return result;
	}

	/**
	 * Preload images for adjacent slides
	 */
	static preloadAdjacent(images: string[], currentIndex: number): void {
		const next = (currentIndex + 1) % images.length;
		const prev =
			(currentIndex - 1 + images.length) % images.length;

		// Preload next and previous images
		[next, prev].forEach((index) => {
			if (images[index]) {
				this.loadImage(images[index]).catch((error) => {
					console.warn("ImageLoader: Preload failed", error);
				});
			}
		});
	}

	/**
	 * Cancel all pending loads and clear cache
	 */
	static cleanup(): void {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
		this.loadingCache.clear();
		this.loadedImages.clear();
	}

	/**
	 * Check if an image is already loaded
	 */
	static isLoaded(src: string): boolean {
		return this.loadedImages.has(src);
	}
}
