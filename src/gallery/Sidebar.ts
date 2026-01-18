import { App, TFile } from "obsidian";
import { formatBytes } from "../utils/formatUtils";

/**
 * Manages the sidebar component that displays file properties and backlinks
 */
export class Sidebar {
	private element: HTMLElement;
	private isCollapsed: boolean = true;
	private width: number = 200;

	constructor(
		private containerEl: HTMLElement,
		private app: App
	) {
		this.element = this.containerEl.createEl("div", {
			cls: "litegal-sidebar",
		});
		this.element.addClass("collapsed");
	}

	/**
	 * Get the sidebar DOM element
	 */
	getElement(): HTMLElement {
		return this.element;
	}

	/**
	 * Check if sidebar is currently collapsed
	 */
	isCollapsedState(): boolean {
		return this.isCollapsed;
	}

	/**
	 * Get current sidebar width
	 */
	getWidth(): number {
		return this.width;
	}

	/**
	 * Set sidebar width
	 */
	setWidth(width: number): void {
		this.width = width;
		if (!this.isCollapsed) {
			this.element.style.width = `${width}px`;
		}
	}

	/**
	 * Show the sidebar
	 */
	show(): void {
		this.isCollapsed = false;
		this.element.removeClass("collapsed");
		this.element.style.width = `${this.width}px`;
	}

	/**
	 * Hide the sidebar
	 */
	hide(): void {
		this.isCollapsed = true;
		this.element.addClass("collapsed");
	}

	/**
	 * Toggle sidebar visibility
	 */
	toggle(): void {
		if (this.isCollapsed) {
			this.show();
		} else {
			this.hide();
		}
	}

	/**
	 * Render sidebar content for a specific file
	 */
	render(file: TFile, codeblockRefs: Map<string, Set<string>>): void {
		this.element.empty();
		if (this.isCollapsed) return;

		const header = this.element.createEl("div", {
			cls: "litegal-sidebar-header",
		});
		header.createEl("h3", { text: "Properties" });

		const props = this.element.createEl("div", {
			cls: "litegal-sidebar-section",
		});

		const sizeFormatted = formatBytes(file.stat.size);
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

		this.element.createEl("h3", { text: "Backlinks" });
		const refsContainer = this.element.createEl("div", {
			cls: "litegal-sidebar-section litegal-refs",
		});

		const backlinks = this.app.metadataCache.getBacklinksForFile(file);
		const refPaths = new Set(backlinks.keys());

		const customRefs = codeblockRefs.get(file.path);
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

	/**
	 * Create a property row in the sidebar
	 */
	private createPropRow(parent: HTMLElement, label: string, value: string): void {
		const row = parent.createEl("div", { cls: "litegal-prop-row" });
		row.createEl("span", { text: label, cls: "litegal-prop-label" });
		const valEl = row.createEl("span", {
			text: value,
			cls: "litegal-prop-value",
		});
		valEl.setAttribute("title", value);
	}
}
