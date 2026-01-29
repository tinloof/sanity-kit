import type {BaseLayoutProps} from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "Sanity kit",
		},
		themeSwitch: {
			mode: "light-dark-system",
		},
	};
}
