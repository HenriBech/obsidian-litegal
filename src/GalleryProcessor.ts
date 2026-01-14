import { App, getLinkpath, Notice, TFile, TFolder } from "obsidian";

export class GalleryProcessor {
	static getImagePaths(
		app: App,
		source: string,
		sourcePath: string
	): string[] {
		const lines = source.split("\n");
		const images: string[] = [];

		for (const line of lines) {
			const trimmedLine = line.trim();
			if (!trimmedLine) continue;

			if (trimmedLine.startsWith("-input:")) {
				const command = trimmedLine.substring(7).trim();
				if (command === "note") {
					this.getFilesFromNote(app, sourcePath).forEach(f => images.push(app.vault.getResourcePath(f)));
				} else if (command.startsWith("folder-recursive:")) {
					const folderPath = command.substring(17).trim();
					this.getFilesFromFolder(app, folderPath, true).forEach(f => images.push(app.vault.getResourcePath(f)));
				} else if (command.startsWith("folder:")) {
					const folderPath = command.substring(7).trim();
					this.getFilesFromFolder(app, folderPath, false).forEach(f => images.push(app.vault.getResourcePath(f)));
				}
			} else if (trimmedLine.startsWith("-")) {
				continue;
			} else {
				const img = this.processImageLine(app, trimmedLine, sourcePath);
				if (img) images.push(img);
			}
		}
		return images;
	}

	static getImages(
		app: App,
		source: string,
		sourcePath: string
	): TFile[] {
		const lines = source.split("\n");
		const files: TFile[] = [];

		for (const line of lines) {
			const trimmedLine = line.trim();
			if (!trimmedLine || trimmedLine.startsWith("-")) continue;

			if (trimmedLine.startsWith("-input:")) {
				const command = trimmedLine.substring(7).trim();
				if (command === "note") {
					files.push(...this.getFilesFromNote(app, sourcePath));
				} else if (command.startsWith("folder-recursive:")) {
					const folderPath = command.substring(17).trim();
					files.push(...this.getFilesFromFolder(app, folderPath, true));
				} else if (command.startsWith("folder:")) {
					const folderPath = command.substring(7).trim();
					files.push(...this.getFilesFromFolder(app, folderPath, false));
				}
			} else {
				const file = this.resolveImageFile(app, trimmedLine, sourcePath);
				if (file) files.push(file);
			}
		}
		return files;
	}

	public static resolveImageFile(
		app: App,
		line: string,
		sourcePath: string
	): TFile | null {
		let image = line.replace(/!?\[\[/, "").replace("]]", "").trim();
		if (image.includes("|")) {
			image = image.split("|")[0];
		}
		if (image.length === 0 || image.match(/^(http|https):\/\//)) return null;

		const linkpath = getLinkpath(image);
		const file = app.metadataCache.getFirstLinkpathDest(
			linkpath,
			sourcePath
		);

		if (file instanceof TFile && this.isImage(file)) {
			return file;
		}
		return null;
	}

	public static processImageLine(
		app: App,
		line: string,
		sourcePath: string
	): string | null {
		const trimmed = line.trim();
		if (trimmed.match(/^(http|https):\/\//)) return trimmed;
		
		const file = this.resolveImageFile(app, line, sourcePath);
		if (file) return app.vault.getResourcePath(file);
		
		return null;
	}

	private static getFilesFromNote(app: App, sourcePath: string): TFile[] {
		const file = app.vault.getAbstractFileByPath(sourcePath);
		if (!(file instanceof TFile)) return [];

		const cache = app.metadataCache.getFileCache(file);
		if (!cache) return [];

		const files: TFile[] = [];
		const processLink = (link: string) => {
			const dest = app.metadataCache.getFirstLinkpathDest(
				getLinkpath(link),
				sourcePath
			);
			if (dest && dest instanceof TFile && this.isImage(dest)) {
				files.push(dest);
			}
		};

		cache.embeds?.forEach((e) => processLink(e.link));

		return files;
	}

	private static getFilesFromFolder(
		app: App,
		folderPath: string,
		recursive: boolean
	): TFile[] {
		const folder = app.vault.getAbstractFileByPath(folderPath);
		if (!(folder instanceof TFolder)) {
			new Notice(`LiteGallery: Folder not found: ${folderPath}`);
			return [];
		}

		const files: TFile[] = [];
		const traverse = (currentFolder: TFolder) => {
			for (const child of currentFolder.children) {
				if (child instanceof TFile && this.isImage(child)) {
					files.push(child);
				} else if (recursive && child instanceof TFolder) {
					traverse(child);
				}
			}
		};
		traverse(folder);
		return files;
	}

	private static isImage(file: TFile): boolean {
		const extensions = ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"];
		return extensions.includes(file.extension.toLowerCase());
	}
}
