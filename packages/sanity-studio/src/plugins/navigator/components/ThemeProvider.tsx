import { ThemeProvider } from "@sanity/ui";
import { buildTheme } from "@sanity/ui/theme";
import type React from "react";

const NavigatorProvider = ({
	children,
}: {
	children: React.ReactNode;
}): React.ReactNode => {
	return <ThemeProvider theme={buildTheme()}>{children}</ThemeProvider>;
};

export default NavigatorProvider;
