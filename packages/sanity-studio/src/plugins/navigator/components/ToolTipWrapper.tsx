import {Box, Text} from "@sanity/ui";
import {Tooltip} from "@sanity/ui/tooltip";
import React from "react";

export default function TooltipWrapper({children, tooltipText, ...rest}) {
	return (
		<Tooltip
			content={
				<Box padding={2}>
					<Text muted size={1}>
						{tooltipText}
					</Text>
				</Box>
			}
			fallbackPlacements={["right", "left"]}
			placement="top"
			portal
		>
			{children}
		</Tooltip>
	);
}
