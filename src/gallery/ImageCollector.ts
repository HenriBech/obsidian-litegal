import { App, TFile } from "obsidian";
import { GalleryProcessor } from "../processors/GalleryProcessor";
import { isImage } from "../utils/imageUtils";
import { BasesViewData, BasesViewConfig, BasesDataEntry } from "./BasesViewTypes";

export interface ImageCollectionResult {
	images: string[];
	files: TFile[];
	codeblockRefs: Map<string, Set<string>>;
}

/**
 * Collects images from Bases view data
 */
export class ImageCollector {
	/**
	 * Collect all images from the view data
	 */
	static async collectImagesFromData(
		data: BasesViewData,
		viewConfig: BasesViewConfig,
		app: App
	): Promise<ImageCollectionResult> {
		const images: string[] = [];
		const files: TFile[] = [];
		const codeblockRefs = new Map<string, Set<string>>();
		const addedPaths = new Set<string>();

		try {
			const showReferenced = viewConfig?.get("show-referenced-images") === true;

			if (data && data.data) {
				for (const entry of data.data) {
					if (!(entry.file instanceof TFile)) continue;

					// Direct image files
					if (isImage(entry.file.extension)) {
						const path = entry.file.path;
						if (!addedPaths.has(path)) {
							images.push(app.vault.getResourcePath(entry.file));
							files.push(entry.file);
							addedPaths.add(path);
						}
					}

					// Process markdown files
					if (entry.file.extension.toLowerCase() === "md") {
						try {
							await this.processMarkdownFile(
								entry,
								app,
								images,
								files,
								codeblockRefs,
								addedPaths,
								showReferenced
							);
						} catch (e) {
							console.error(`LiteGallery: Error processing markdown file ${entry.file.path}`, e);
						}
					}
				}
			}
		} catch (e) {
			console.error("LiteGallery: Error collecting images from data", e);
		}

		return { images, files, codeblockRefs };
	}

	/**
	 * Process a markdown file to extract images
	 */
	private static async processMarkdownFile(
		entry: BasesDataEntry,
		app: App,
		images: string[],
		files: TFile[],
		codeblockRefs: Map<string, Set<string>>,
		addedPaths: Set<string>,
		showReferenced: boolean
	): Promise<void> {
		const content = await app.vault.read(entry.file);

		// Process litegal codeblocks
		const regex = /```\s*litegal\s*([\s\S]*?)```/g;
		let match;
		while ((match = regex.exec(content)) !== null) {
			const source = match[1];
			const extractedFiles = GalleryProcessor.getImages(
				app,
				source,
				entry.file.path
			);
			for (const f of extractedFiles) {
				if (!codeblockRefs.has(f.path)) {
					codeblockRefs.set(f.path, new Set());
				}
				codeblockRefs.get(f.path)?.add(entry.file.path);
				if (showReferenced && !addedPaths.has(f.path)) {
					images.push(app.vault.getResourcePath(f));
					files.push(f);
					addedPaths.add(f.path);
				}
			}
		}

		if (showReferenced) {
			// Process embeds
			const cache = app.metadataCache.getFileCache(entry.file);
			if (cache && cache.embeds) {
				for (const embed of cache.embeds) {
					const file = app.metadataCache.getFirstLinkpathDest(
						embed.link,
						entry.file.path
					);
					if (
						file instanceof TFile &&
						isImage(file.extension) &&
						!addedPaths.has(file.path)
					) {
						images.push(app.vault.getResourcePath(file));
						files.push(file);
						addedPaths.add(file.path);
					}
				}
			}

			// Process properties
			const allProps = (entry as any).allProperties;
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
						const file = app.metadataCache.getFirstLinkpathDest(
							linkText
								.replace(/!?\[\[/, "")
								.replace("]]", "")
								.split("|")[0],
							entry.file.path
						);
						if (
							file instanceof TFile &&
							isImage(file.extension) &&
							!addedPaths.has(file.path)
						) {
							images.push(app.vault.getResourcePath(file));
							files.push(file);
							addedPaths.add(file.path);
						}
					}
				}
			}
		}
	}
}
