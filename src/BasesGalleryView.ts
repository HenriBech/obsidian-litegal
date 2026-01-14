import { BasesView, QueryController, TFile } from "obsidian";
import { GalleryUI } from "./GalleryUI";
import {
	LiteGallerySettings,
	DEFAULT_SETTINGS,
	GalleryAspectOptions,
	PreviewAspectOptions,
} from "./SettingTab";
import { GalleryProcessor } from "./GalleryProcessor";

export class LiteGalleryBasesView extends BasesView {
	type = "litegal-bases-view";
	containerEl: HTMLElement;
	resizeObserver: ResizeObserver;
	ui: GalleryUI | null = null;

	private codeblockRefs: Map<string, Set<string>> = new Map();
	private files: TFile[] = [];
	private sidebarEl: HTMLElement;
	private sidebarWidth: number = 200;
	private isCollapsed: boolean = true;

	constructor(controller: QueryController, containerEl: HTMLElement) {
		console.log("LiteGalleryBasesView constructor");	
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
		const gallery = this.containerEl.querySelector(
			".litegal"
		) as HTMLElement;
		if (gallery) {
			gallery.style.setProperty("--gallery-height", `${height}px`);
		}
	}

	async onDataUpdated(): Promise<void> {
		this.containerEl.empty();
		this.files = [];
		this.codeblockRefs.clear();
		const images: string[] = [];
		const addedPaths = new Set<string>();

		const data = (this as any).data;
		const viewConfig = (this as any).config;
		const showReferenced =
			viewConfig?.get("show-referenced-images") === true;

		if (data && data.data) {
			for (const entry of data.data) {
				if (!(entry.file instanceof TFile)) continue;
				if (this.isImage(entry.file.extension)) {
					const path = entry.file.path;
					if (!addedPaths.has(path)) {
						images.push(this.app.vault.getResourcePath(entry.file));
						this.files.push(entry.file);
						addedPaths.add(path);
					}
				}
				if (entry.file.extension.toLowerCase() === "md") {
					const content = await this.app.vault.read(entry.file);
					const regex = /```\s*litegal\s*([\s\S]*?)```/g;
					let match;
					while ((match = regex.exec(content)) !== null) {
						const source = match[1];
						const extractedFiles = GalleryProcessor.getImages(
							this.app,
							source,
							entry.file.path
						);
						for (const f of extractedFiles) {
							if (!this.codeblockRefs.has(f.path)) {
								this.codeblockRefs.set(f.path, new Set());
							}
							this.codeblockRefs
								.get(f.path)
								?.add(entry.file.path);
							if (showReferenced && !addedPaths.has(f.path)) {
								images.push(this.app.vault.getResourcePath(f));
								this.files.push(f);
								addedPaths.add(f.path);
							}
						}
					}
					if (showReferenced) {
						const cache = this.app.metadataCache.getFileCache(
							entry.file
						);
						if (cache && cache.embeds) {
							for (const embed of cache.embeds) {
								const file =
									this.app.metadataCache.getFirstLinkpathDest(
										embed.link,
										entry.file.path
									);
								if (
									file instanceof TFile &&
									this.isImage(file.extension) &&
									!addedPaths.has(file.path)
								) {
									images.push(
										this.app.vault.getResourcePath(file)
									);
									this.files.push(file);
									addedPaths.add(file.path);
								}
							}
						}
						const allProps = (this as any).allProperties;
						if (allProps) {
							for (const propId of allProps) {
								const val = entry.getValue(propId);
								if (
									val &&
									(val.constructor.name === "LinkValue" ||
										val.constructor.name === "ImageValue" ||
										val.constructor.name === "StringValue")
								) {
									const linkText = val.toString();
									const file =
										this.app.metadataCache.getFirstLinkpathDest(
											linkText
												.replace(/!?\[\[/, "")
												.replace("]]", "")
												.split("|")[0],
											entry.file.path
										);
									if (
										file instanceof TFile &&
										this.isImage(file.extension) &&
										!addedPaths.has(file.path)
									) {
										images.push(
											this.app.vault.getResourcePath(file)
										);
										this.files.push(file);
										addedPaths.add(file.path);
									}
								}
							}
						}
					}
				}
			}
		}

		if (images.length === 0) {
			this.containerEl.createEl("div", {
				text: "No image files found in this view.",
				cls: "litegal-no-images",
			});
			return;
		}

		const mainContent = this.containerEl.createEl("div", {
			cls: "litegal-bases-main",
		});

		const resizer = this.containerEl.createEl("div", {
			cls: "litegal-resizer",
		});
		this.sidebarEl = this.containerEl.createEl("div", {
			cls: "litegal-sidebar",
		});

		if (this.isCollapsed) {
			this.sidebarEl.addClass("collapsed");
			resizer.addClass("hidden");
		} else {
			this.sidebarEl.style.width = `${this.sidebarWidth}px`;
		}

		this.initResizer(resizer);

		const toggle = mainContent.createEl("div", {
			cls: `litegal-control litegal-sidebar-toggle ${
				this.isCollapsed ? "collapsed" : ""
			}`,
			text: this.isCollapsed ? "ⓘ" : "»",
		});
		toggle.onclick = () => {
			this.isCollapsed = !this.isCollapsed;
			if (this.isCollapsed) {
				this.sidebarEl.addClass("collapsed");
				resizer.addClass("hidden");
				toggle.addClass("collapsed");
				toggle.setText("ⓘ");
			} else {
				this.sidebarEl.removeClass("collapsed");
				resizer.removeClass("hidden");
				toggle.removeClass("collapsed");
				toggle.setText("»");
				if (this.ui?.activeSlide !== undefined) {
					this.renderSidebar(this.files[this.ui.activeSlide]);
				}
			}
		};

		const settings: LiteGallerySettings = {
			...DEFAULT_SETTINGS,
			galleryAspect: GalleryAspectOptions.contain,
			previewAspect: PreviewAspectOptions.fitToHeight,
			targetHeightPx: this.containerEl.clientHeight - 140,
		} as LiteGallerySettings;

		const activeSlide = this.ui?.activeSlide;

		this.ui = new GalleryUI(
			mainContent,
			images,
			settings,
			(index) => {
				this.renderSidebar(this.files[index]);
			},
			activeSlide
		);
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

		const header = this.sidebarEl.createEl("div", {
			cls: "litegal-sidebar-header",
		});
		header.createEl("h3", { text: "Properties" });

		const props = this.sidebarEl.createEl("div", {
			cls: "litegal-sidebar-section",
		});

		const sizeFormatted = this.formatBytes(file.stat.size);
		this.createPropRow(props, "Name", file.name);
		this.createPropRow(props, "Size", sizeFormatted);
		this.createPropRow(props, "Type", file.extension.toUpperCase());
		this.createPropRow(props, "Location", file.parent?.path || "/");

		// TODO: I dont know if obsidian exposes date format config, so hardcoding for now
		const dateFormat = "YYYY-MM-DD HH:mm:ss";
		const modifiedDate = (window as any)
			.moment(file.stat.mtime)
			.format(dateFormat);
		this.createPropRow(props, "Modified", modifiedDate);

		this.sidebarEl.createEl("h3", { text: "Backlinks" });
		const refsContainer = this.sidebarEl.createEl("div", {
			cls: "litegal-sidebar-section litegal-refs",
		});

		const backlinks = this.app.metadataCache.getBacklinksForFile(file);
		const refPaths = new Set(backlinks.keys());

		const customRefs = this.codeblockRefs.get(file.path);
		if (customRefs) {
			customRefs.forEach((path) => refPaths.add(path));
		}

		if (refPaths.size === 0) {
			refsContainer.createEl("div", {
				text: "No backlinks found.",
				cls: "litegal-no-refs",
			});
		} else {
			const list = refsContainer.createEl("ul");
			for (const path of refPaths) {
				const li = list.createEl("li");
				const link = li.createEl("a", {
					text: path,
					cls: "internal-link",
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
		const valEl = row.createEl("span", {
			text: value,
			cls: "litegal-prop-value",
		});
		valEl.setAttribute("title", value);
	}

	private formatBytes(bytes: number, decimals: number = 2): string {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return (
			parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
		);
	}

	private isImage(ext: string) {
		return ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"].includes(
			ext.toLowerCase()
		);
	}
}
