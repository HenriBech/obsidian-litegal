/**
 * Check if a file extension is a supported image format
 */
export function isImage(extension: string): boolean {
	const supportedExtensions = ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"];
	return supportedExtensions.includes(extension.toLowerCase());
}
