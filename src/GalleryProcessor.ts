import { App, getLinkpath, Notice, TFile } from "obsidian";

export class GalleryProcessor {
	static getImagePaths(app: App, source: string): string[] {
		const DEFAULT_404 =
			"https://raw.githubusercontent.com/jpoles1/obsidian-litegal/eb0e30b2709a3081dd8d32ef4371367b95694881/404notfound.jpg";

		return source
			.split("\n")
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
