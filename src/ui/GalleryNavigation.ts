/**
 * Navigation handlers for keyboard controls
 */
export interface NavigationHandlers {
	onPrevious: () => void;
	onNext: () => void;
	onFirst?: () => void;
	onLast?: () => void;
	onEscape?: () => void;
	onToggleLightbox?: () => void;
	onToggleInfo?: () => void;
}

/**
 * Setup keyboard navigation on an element
 */
export function setupKeyboardNavigation(
	element: HTMLElement,
	handlers: NavigationHandlers,
	hotkeys: { [key: string]: string }
): void {
	element.tabIndex = 0;
	element.addEventListener("keydown", (e: KeyboardEvent) => {
		if (e.key === hotkeys.previous) {
			handlers.onPrevious();
			e.preventDefault();
		} else if (e.key === hotkeys.next) {
			handlers.onNext();
			e.preventDefault();
		} else if (e.key === hotkeys.first && handlers.onFirst) {
			handlers.onFirst();
			e.preventDefault();
		} else if (e.key === hotkeys.last && handlers.onLast) {
			handlers.onLast();
			e.preventDefault();
		} else if (e.key === hotkeys.escape && handlers.onEscape) {
			handlers.onEscape();
			e.preventDefault();
		} else if (e.key === hotkeys.toggleLightbox && handlers.onToggleLightbox) {
			handlers.onToggleLightbox();
			e.preventDefault();
		} else if (e.key === hotkeys.toggleInfo && handlers.onToggleInfo) {
			handlers.onToggleInfo();
			e.preventDefault();
		}
	});
}

/**
 * Create an arrow navigation button
 */
export function createArrow(
	parent: HTMLElement,
	text: string,
	side: string,
	onClick: () => void
): HTMLElement {
	const arrow = parent.createEl("div", {
		text,
		cls: `litegal-control litegal-arrow litegal-arrow-${side}`,
	});
	arrow.onclick = onClick;
	return arrow;
}
