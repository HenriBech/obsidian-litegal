import { TFile } from "obsidian";

/**
 * Type definitions for Obsidian Bases view integration
 */

export interface BasesDataEntry {
	file: TFile;
	getValue(propId: string): any;
	allProperties?: string[];
}

export interface BasesViewData {
	data: BasesDataEntry[];
}

export interface BasesViewConfig {
	get(key: string): any;
}

/**
 * Magic numbers and constants for BasesGalleryView
 */
export const GALLERY_CONSTANTS = {
	/** Vertical padding to subtract from container height for gallery */
	VERTICAL_PADDING: 140,
	/** Default sidebar width in pixels */
	DEFAULT_SIDEBAR_WIDTH: 200,
	/** Minimum sidebar width in pixels */
	MIN_SIDEBAR_WIDTH: 150,
	/** Maximum sidebar width as percentage of container */
	MAX_SIDEBAR_WIDTH_RATIO: 0.7,
} as const;
