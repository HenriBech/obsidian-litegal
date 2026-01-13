import { Notice } from "obsidian";
import {
	GalleryAspectOptions,
	LiteGallerySettings,
	PaginationIndicatorOptions,
	PreviewAspectOptions,
	PreviewLayoutOptions,
} from "./SettingTab";

export const processCodeBlockSettings = (
	source: string,
	defaults: LiteGallerySettings
): LiteGallerySettings => {
	const settings = { ...defaults };

	const keyMapping = {
		preview: "previewLayout",
		pagination: "paginationIndicator",
		preview_aspect: "previewAspect",
		gallery_aspect: "galleryAspect",
	} as const;

	const valueMapping: Record<keyof typeof keyMapping, string[]> = {
		preview: Object.values(PreviewLayoutOptions),
		pagination: Object.values(PaginationIndicatorOptions),
		preview_aspect: Object.values(PreviewAspectOptions),
		gallery_aspect: Object.values(GalleryAspectOptions),
	};

	const lines = source.split("\n").filter((line) => line.startsWith("-"));

	function isValidKey(key: string): key is keyof typeof keyMapping {
		return key in keyMapping;
	}

	lines.forEach((line) => {
		const parts = line.slice(1).split(":");

		const key = parts[0].trim();
		const value = parts[1].trim();

		if (key === "input") return;

		if (parts.length != 2) {
			new Notice(
				"LiteGallery: Invalid setting format. Expected '-key: value'"
			);
			return;
		}

		if (key == "height") {
			const numericValue = parseInt(value);

			if (numericValue > 0) {
				settings.targetHeightPx = numericValue;
				return;
			} else {
				new Notice(
					`LiteGallery: Invalid value "${value}" for "height". \nExpected positive integer`
				);
				return;
			}
		}

		if (!isValidKey(key)) {
			new Notice(
				`LiteGallery: Invalid setting key "${key}. Expected one of ${Object.keys(
					keyMapping
				).join(", ")}"`
			);
			return;
		}

		const validValues = valueMapping[key];
		const targetKey = keyMapping[key];

		if (validValues.includes(value)) {
			(settings as any)[targetKey] = value;
		} else {
			new Notice(
				`LiteGallery: Invalid value "${value}" for "${key}". \nExpected: ${validValues.join(
					", "
				)}`
			);
		}
	});

	return settings;
};
