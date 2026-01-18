/**
 * Navigation handlers for keyboard controls
 */
export interface NavigationHandlers {
	onPrevious: () => void;
	onNext: () => void;
	onFirst?: () => void;
	onLast?: () => void;
	onEscape?: () => void;
}

/**
 * Setup keyboard navigation on an element
 */
export function setupKeyboardNavigation(
	element: HTMLElement,
	handlers: NavigationHandlers
): void {
	element.tabIndex = 0;
	element.addEventListener("keydown", (e: KeyboardEvent) => {
		if (e.key === "ArrowLeft") {
			handlers.onPrevious();
			e.preventDefault();
		} else if (e.key === "ArrowRight") {
			handlers.onNext();
			e.preventDefault();
		} else if (e.key === "ArrowDown" && handlers.onFirst) {
			handlers.onFirst();
			e.preventDefault();
		} else if (e.key === "ArrowUp" && handlers.onLast) {
			handlers.onLast();
			e.preventDefault();
		} else if (e.key === "Escape" && handlers.onEscape) {
			handlers.onEscape();
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
