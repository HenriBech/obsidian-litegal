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
				const command = trimmedLine.substring(7).trim(); // Remove "-input:"
				if (command === "note") {
					images.push(...this.getImagesFromNote(app, sourcePath));
				} else if (command.startsWith("folder-recursive:")) {
					const folderPath = command.substring(17).trim();
					images.push(
						...this.getImagesFromFolder(app, folderPath, true)
					);
				} else if (command.startsWith("folder:")) {
					const folderPath = command.substring(7).trim();
					images.push(
						...this.getImagesFromFolder(app, folderPath, false)
					);
				}
			} else if (trimmedLine.startsWith("-")) {
				// Ignore settings
				continue;
			} else {
				// Handle normal image link/path
				const img = this.processImageLine(app, trimmedLine, sourcePath);
				if (img) images.push(img);
			}
		}
		return images;
	}

	private static processImageLine(
		app: App,
		line: string,
		sourcePath: string
	): string | null {
		const image = line.replace(/!?\[\[/, "").replace("]]", "").trim();
		if (image.length === 0) return null;

		if (image.match(/^(http|https):\/\//)) return image;

		const linkpath = getLinkpath(image);
		const file = app.metadataCache.getFirstLinkpathDest(
			linkpath,
			sourcePath
		);

		if (!file) {
			new Notice(`LiteGallery: Image not found: ${image}`);
			return null;
		}
		return app.vault.getResourcePath(file);
	}

	private static getImagesFromNote(app: App, sourcePath: string): string[] {
		const file = app.vault.getAbstractFileByPath(sourcePath);
		if (!(file instanceof TFile)) return [];

		const cache = app.metadataCache.getFileCache(file);
		if (!cache) return [];

		const paths: string[] = [];
		const processLink = (link: string) => {
			const dest = app.metadataCache.getFirstLinkpathDest(
				getLinkpath(link),
				sourcePath
			);
			if (dest && dest instanceof TFile && this.isImage(dest)) {
				paths.push(app.vault.getResourcePath(dest));
			}
		};

		cache.embeds?.forEach((e) => processLink(e.link));
		cache.links?.forEach((l) => processLink(l.link));

		return paths;
	}

	private static getImagesFromFolder(
		app: App,
		folderPath: string,
		recursive: boolean
	): string[] {
		const folder = app.vault.getAbstractFileByPath(folderPath);
		if (!(folder instanceof TFolder)) {
			new Notice(`LiteGallery: Folder not found: ${folderPath}`);
			return [];
		}

		const paths: string[] = [];
		const traverse = (currentFolder: TFolder) => {
			for (const child of currentFolder.children) {
				if (child instanceof TFile && this.isImage(child)) {
					paths.push(app.vault.getResourcePath(child));
				} else if (recursive && child instanceof TFolder) {
					traverse(child);
				}
			}
		};
		traverse(folder);
		return paths;
	}

	private static isImage(file: TFile): boolean {
		const extensions = ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"];
		return extensions.includes(file.extension.toLowerCase());
	}
}
