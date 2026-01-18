import { BasesView, QueryController, TFile } from "obsidian";
import { GalleryUI } from "../ui/GalleryUI";
import {
	LiteGallerySettings,
	DEFAULT_SETTINGS,
	GalleryAspectOptions,
	PreviewAspectOptions,
} from "../types";
import { ImageCollector } from "./ImageCollector";
import { Sidebar } from "./Sidebar";
import {
	BasesViewData,
	BasesViewConfig,
	GALLERY_CONSTANTS,
} from "./BasesViewTypes";

/**
 * Bases view integration for LiteGallery
 */
export class LiteGalleryBasesView extends BasesView {
	type = "litegal-bases-view";
	containerEl: HTMLElement;
	resizeObserver: ResizeObserver;
	ui: GalleryUI | null = null;

	private files: TFile[] = [];
	private codeblockRefs: Map<string, Set<string>> = new Map();
	private sidebar: Sidebar;
	private sidebarEl: HTMLElement;
	private resizerEl: HTMLElement;
	private sidebarWidth: number = GALLERY_CONSTANTS.DEFAULT_SIDEBAR_WIDTH;
	private resizeHandlers: { move: (e: MouseEvent) => void; up: () => void } | null = null;

	constructor(controller: QueryController, containerEl: HTMLElement) {
		super(controller);
		this.containerEl = containerEl;
	}

	onload() {
		this.containerEl.style.overflow = "hidden";
		this.containerEl.addClass("litegal-bases-view-container");
		this.resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const height = entry.contentRect.height - GALLERY_CONSTANTS.VERTICAL_PADDING;
				this.updateHeight(height);
			}
		});
		this.resizeObserver.observe(this.containerEl);
	}

	onunload() {
		this.containerEl.style.overflow = "auto";
		this.containerEl.removeClass("litegal-bases-view-container");
		
		// Clean up resize observer
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}
		
		// Clean up resize handlers
		if (this.resizeHandlers) {
			window.removeEventListener("mousemove", this.resizeHandlers.move);
			window.removeEventListener("mouseup", this.resizeHandlers.up);
			this.resizeHandlers = null;
		}
		
		// Clean up UI
		if (this.ui) {
			this.ui = null;
		}
	}

	updateHeight(height: number) {
		const gallery = this.containerEl.querySelector(
			".litegal"
		) as HTMLElement;
		if (gallery) {
			gallery.style.setProperty("--gallery-height", `${height}px`);
		}
	}

	async onDataUpdated(activeSlide?: number): Promise<void> {
		try {
			this.containerEl.empty();

			const data = (this as any).data as BasesViewData;
			const viewConfig = (this as any).config as BasesViewConfig;

			// Show loading state
			const loader = this.containerEl.createEl("div", {
				cls: "litegal-loader",
				text: "Loading gallery...",
			});

			try {
				// Collect images using ImageCollector
				const result = await ImageCollector.collectImagesFromData(
					data,
					viewConfig,
					this.app
				);

				this.files = result.files;
				this.codeblockRefs = result.codeblockRefs;
				const images = result.images;

				// Remove loader
				loader.remove();

				if (images.length === 0) {
					this.showEmptyState();
					return;
				}

				// Create main content area
				const mainContent = this.containerEl.createEl("div", {
					cls: "litegal-bases-main",
				});

				// Create resizer and sidebar using Sidebar component
				this.resizerEl = this.containerEl.createEl("div", {
					cls: "litegal-resizer",
				});
				this.sidebar = new Sidebar(this.containerEl, this.app);
				this.sidebarEl = this.sidebar.getElement();

				// Set initial state
				if (this.sidebar.isCollapsedState()) {
					this.resizerEl.addClass("hidden");
				} else {
					this.sidebar.setWidth(this.sidebarWidth);
				}

				this.initResizer();

				// Create sidebar toggle button
				const toggle = mainContent.createEl("div", {
					cls: `litegal-control litegal-sidebar-toggle ${
						this.sidebar.isCollapsedState() ? "collapsed" : ""
					}`,
					text: this.sidebar.isCollapsedState() ? "ⓘ" : "»",
				});
				
				const handleSidebarToggle = () => {
					this.sidebar.toggle();
					
					// Update UI elements
					if (this.sidebar.isCollapsedState()) {
						this.resizerEl.addClass("hidden");
						toggle.addClass("collapsed");
						toggle.setText("ⓘ");
					} else {
						this.resizerEl.removeClass("hidden");
						toggle.removeClass("collapsed");
						toggle.setText("»");
						// Render sidebar content for current slide
						if (this.ui?.activeSlide !== undefined) {
							this.sidebar.render(
								this.files[this.ui.activeSlide],
								this.codeblockRefs
							);
						}
					}

					this.ui?.focus();
				};

				toggle.onclick = handleSidebarToggle;

				// Create gallery UI
				const settings: LiteGallerySettings = {
					...DEFAULT_SETTINGS,
					galleryAspect: GalleryAspectOptions.contain,
					previewAspect: PreviewAspectOptions.fitToHeight,
					targetHeightPx: this.containerEl.clientHeight - GALLERY_CONSTANTS.VERTICAL_PADDING,
				} as LiteGallerySettings;

				this.ui = new GalleryUI(
					mainContent,
					images,
					settings,
					(index) => {
						this.sidebar.render(this.files[index], this.codeblockRefs);
					},
					activeSlide,
					handleSidebarToggle
				);
			} catch (innerError) {
				loader.remove();
				throw innerError;
			}
		} catch (error) {
			console.error("LiteGallery: Error updating gallery view", error);
			this.showErrorState(error instanceof Error ? error.message : "Unknown error");
		}
	}

	private showEmptyState(): void {
		const emptyState = this.containerEl.createEl("div", {
			cls: "litegal-empty-state",
		});
		emptyState.createEl("h3", { text: "No Images Found" });
		emptyState.createEl("p", {
			text: "Try enabling 'Show linked images' in view options, or add images to your notes.",
		});
	}

	private showErrorState(message: string): void {
		this.containerEl.createEl("div", {
			text: `Error loading gallery: ${message}`,
			cls: "litegal-error-message",
		});
	}

	private initResizer(): void {
		let isResizing = false;

		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing) return;

			const containerRect = this.containerEl.getBoundingClientRect();
			const newWidth = containerRect.right - e.clientX;

			const minWidth = GALLERY_CONSTANTS.MIN_SIDEBAR_WIDTH;
			const maxWidth = containerRect.width * GALLERY_CONSTANTS.MAX_SIDEBAR_WIDTH_RATIO;

			if (newWidth > minWidth && newWidth < maxWidth) {
				this.sidebarWidth = newWidth;
				this.sidebar.setWidth(newWidth);
			}
		};

		const handleMouseUp = () => {
			if (isResizing) {
				isResizing = false;
				document.body.removeClass("litegal-resizing");
			}
		};

		this.resizerEl.onmousedown = (e) => {
			isResizing = true;
			document.body.addClass("litegal-resizing");
			e.preventDefault();
		};

		// Store handlers for cleanup in onunload
		this.resizeHandlers = {
			move: handleMouseMove,
			up: handleMouseUp,
		};

		// Add event listeners to window
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
	}
}
