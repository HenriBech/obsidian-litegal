import {
	BasesView,
	QueryController,
	TFile,
} from "obsidian";
import { GalleryUI } from "./GalleryUI";
import { LiteGallerySettings, DEFAULT_SETTINGS, GalleryAspectOptions, PreviewAspectOptions } from "./SettingTab";

export class LiteGalleryBasesView extends BasesView {
	type = "litegal-bases-view";
	containerEl: HTMLElement;
	resizeObserver: ResizeObserver;

	private files: TFile[] = [];
	private sidebarEl: HTMLElement;
	private sidebarWidth: number = 200;
	private isCollapsed: boolean = true;

	constructor(controller: QueryController, containerEl: HTMLElement) {
		super(controller);
		this.containerEl = containerEl;
	}

	onload() {
		this.containerEl.style.overflow = "hidden";
		this.containerEl.addClass("litegal-bases-view-container");
		this.resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const height = entry.contentRect.height - 140;
				this.updateHeight(height);
			}
		});
		this.resizeObserver.observe(this.containerEl);
	}

	onunload() {
		this.containerEl.style.overflow = "auto";
		this.containerEl.removeClass("litegal-bases-view-container");
		this.resizeObserver.disconnect();
	}

	updateHeight(height: number) {
		const gallery = this.containerEl.querySelector(".litegal") as HTMLElement;
		if (gallery) {
			gallery.style.setProperty("--gallery-height", `${height}px`);
		}
	}

	onDataUpdated(): void {
		this.containerEl.empty();
		this.files = [];
		const images: string[] = [];

		if (this.data && this.data.data) {
			for (const entry of this.data.data) {
				if (entry.file instanceof TFile && this.isImage(entry.file.extension)) {
					const path = this.app.vault.getResourcePath(entry.file);
					images.push(path);
					this.files.push(entry.file);
				}
			}
		}

		if (images.length === 0) {
			this.containerEl.createEl("div", { 
				text: "No image files found in this view.",
				cls: "litegal-no-images" 
			});
			return;
		}

		const mainContent = this.containerEl.createEl("div", { cls: "litegal-bases-main" });
		
		const resizer = this.containerEl.createEl("div", { cls: "litegal-resizer" });
		this.sidebarEl = this.containerEl.createEl("div", { cls: "litegal-sidebar" });
		
		if (this.isCollapsed) {
			this.sidebarEl.addClass("collapsed");
			resizer.addClass("hidden");
		} else {
			this.sidebarEl.style.width = `${this.sidebarWidth}px`;
		}

		this.initResizer(resizer);

		// Add collapse toggle to gallery space
		const toggle = mainContent.createEl("div", { 
			cls: `litegal-control litegal-sidebar-toggle ${this.isCollapsed ? "collapsed" : ""}`,
			text: this.isCollapsed ? "ⓘ" : "»"
		});
		toggle.onclick = () => {
			this.isCollapsed = !this.isCollapsed;
			this.onDataUpdated();
		};

		const settings: LiteGallerySettings = { 
			...DEFAULT_SETTINGS, 
			galleryAspect: GalleryAspectOptions.contain,
			previewAspect: PreviewAspectOptions.fitToHeight,
			targetHeightPx: this.containerEl.clientHeight - 140,
		} as LiteGallerySettings;
		
		new GalleryUI(mainContent, images, settings, (index) => {
			this.renderSidebar(this.files[index]);
		});
	}

	private initResizer(resizer: HTMLElement) {
		let isResizing = false;

		resizer.onmousedown = (e) => {
			isResizing = true;
			document.body.addClass("litegal-resizing");
			e.preventDefault();
		};

		window.onmousemove = (e) => {
			if (!isResizing) return;
			
			const containerRect = this.containerEl.getBoundingClientRect();
			const newWidth = containerRect.right - e.clientX;
			
			if (newWidth > 150 && newWidth < containerRect.width * 0.7) {
				this.sidebarWidth = newWidth;
				this.sidebarEl.style.width = `${newWidth}px`;
			}
		};

		window.onmouseup = () => {
			if (isResizing) {
				isResizing = false;
				document.body.removeClass("litegal-resizing");
			}
		};
	}

	private renderSidebar(file: TFile) {
		this.sidebarEl.empty();
		if (this.isCollapsed) return;

		const header = this.sidebarEl.createEl("div", { cls: "litegal-sidebar-header" });
		header.createEl("h3", { text: "Properties" });
		
		const props = this.sidebarEl.createEl("div", { cls: "litegal-sidebar-section" });
		
		const sizeFormatted = this.formatBytes(file.stat.size);
		this.createPropRow(props, "Name", file.name);
		this.createPropRow(props, "Size", sizeFormatted);
		this.createPropRow(props, "Type", file.extension.toUpperCase());
		this.createPropRow(props, "Location", file.parent?.path || "/");
		
		// Use Obsidian's date format if available, otherwise fallback
		const dateFormat = (this.app as any).vault.getConfig("dateFormat") || "YYYY-MM-DD HH:mm:ss";
		const modifiedDate = (window as any).moment(file.stat.mtime).format(dateFormat);
		this.createPropRow(props, "Modified", modifiedDate);

		this.sidebarEl.createEl("h3", { text: "Backlinks" });
		const refsContainer = this.sidebarEl.createEl("div", { cls: "litegal-sidebar-section litegal-refs" });
		
		const backlinks = this.app.metadataCache.getBacklinksForFile(file);
		const refPaths = backlinks.keys();
		
		if (refPaths.length === 0) {
			refsContainer.createEl("div", { text: "No backlinks found.", cls: "litegal-no-refs" });
		} else {
			const list = refsContainer.createEl("ul");
			for (const path of refPaths) {
				const li = list.createEl("li");
				const link = li.createEl("a", { 
					text: path, 
					cls: "internal-link" 
				});
				link.setAttribute("title", path);
				link.onclick = (e) => {
					this.app.workspace.openLinkText(path, "", true);
					e.preventDefault();
				};
			}
		}
	}

	private createPropRow(parent: HTMLElement, label: string, value: string) {
		const row = parent.createEl("div", { cls: "litegal-prop-row" });
		row.createEl("span", { text: label, cls: "litegal-prop-label" });
		const valEl = row.createEl("span", { text: value, cls: "litegal-prop-value" });
		valEl.setAttribute("title", value);
	}

	private formatBytes(bytes: number, decimals: number = 2): string {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
	}

	private isImage(ext: string) {
		return ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"].includes(ext.toLowerCase());
	}
}
