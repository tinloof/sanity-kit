import {Box, type ButtonTone, Text} from "@sanity/ui";
import {Tooltip} from "@sanity/ui/tooltip";
import type {ComponentType, PropsWithChildren} from "react";
import {TextWithTone} from "sanity";

type InfoIconProps = PropsWithChildren & {
	icon: ComponentType;
	tone: ButtonTone;
	text?: string;
};

export default function InfoIcon(props: InfoIconProps) {
	const {text, icon, tone, children} = props;
	const Icon = icon;

	return (
		<Tooltip
			animate
			portal
			content={
				children ? (
					children
				) : (
					<Box padding={2}>
						<Text size={1}>{text}</Text>
					</Box>
				)
			}
		>
			<TextWithTone tone={tone} size={1}>
				<Icon />
			</TextWithTone>
		</Tooltip>
	);
}
