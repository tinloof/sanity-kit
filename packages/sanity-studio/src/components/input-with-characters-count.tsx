import type { BadgeTone } from "@sanity/ui";
import { Badge, Flex, Stack } from "@sanity/ui";
import type { ReactElement } from "react";
import type { TextInputProps, TextOptions } from "sanity";
import { useFormValue } from "sanity";

type CountedTextOptions = {
	maxLength?: number;
	minLength?: number;
} & TextOptions;

function CharacterCount(props: { value?: string } & CountedTextOptions) {
	if (!props.maxLength && !props.minLength) {
		return null;
	}

	const { value = "" } = props;

	const maxPercentage =
		props.maxLength && (value.length / props.maxLength) * 100;

	let tone: BadgeTone = "primary";

	if (maxPercentage && maxPercentage > 100) {
		tone = "critical";
	} else if (maxPercentage && maxPercentage > 75) {
		tone = "caution";
	}

	if (props.minLength && value.length < props.minLength) {
		tone = "caution";
	}
	return (
		<Badge tone={tone}>
			{value.length} / {props.maxLength}
		</Badge>
	);
}

export function InputWithCharacterCount(props: TextInputProps): ReactElement {
	const document = useFormValue([]);

	if (!document) {
		return props.renderDefault(props);
	}

	const { name, title } = document as {
		name?: string;
		title?: string;
	};

	let defaultTitle: string | undefined;

	if (props.id === "seo.title") {
		defaultTitle = title ?? name ?? undefined;
	}

	props.elementProps.placeholder = defaultTitle;

	return (
		<Stack space={2}>
			{props.renderDefault(props)}
			<Flex justify="flex-end">
				<CharacterCount
					value={props.value}
					{...((props.schemaType.options || {}) as CountedTextOptions)}
				/>
			</Flex>
		</Stack>
	);
}
