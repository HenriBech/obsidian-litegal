import { App, getLinkpath, Notice } from "obsidian";

export class GalleryProcessor {
	static getImagePaths(app: App, source: string): string[] {
		return source
			.split("\n")
			.filter((line) => !line.startsWith("-"))
			.map((line) =>
				line
					.replace(/!?\[\[/, "")
					.replace("]]", "")
					.trim()
			)
			.filter((line) => line.length > 0)
			.map((image) => {
				if (image.match(/^(http|https):\/\//)) return image;

				const linkpath = getLinkpath(image);
				const file = app.metadataCache.getFirstLinkpathDest(
					linkpath,
					""
				);

				if (!file) {
					new Notice(`LiteGallery: Image not found: ${image}`);
					return null;
				}
				return app.vault.getResourcePath(file);
			})
			.filter((path): path is string => path !== null);
	}
}
