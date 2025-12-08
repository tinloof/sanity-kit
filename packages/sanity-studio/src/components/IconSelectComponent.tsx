import { AddCircleIcon, SearchIcon, TrashIcon } from "@sanity/icons";
import {
	Box,
	Button,
	Card,
	Dialog,
	Flex,
	Grid,
	Text,
	TextInput,
} from "@sanity/ui";
import { type ReactElement, useCallback, useState } from "react";
import { set, unset } from "sanity";
import { styled } from "styled-components";

import type { IconInputProps, IconOptions } from "../types";

const IconContainer = styled(Box)`
  border-radius: 4px;
  cursor: pointer;
`;

const FlexContainer = styled(Flex)`
  cursor: pointer;
  &:hover {
    background-color: var(--card-bg-color);
  }
  width: 100%;
  border: 1px solid var(--card-border-color);
  border-radius: 1px;
`;

const BlockVariantCardContainer = styled(Card)`
  box-sizing: content-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  max-height: 16rem;
  max-width: 24rem;
  border-radius: 0.5rem;
  background-color: transparent;
  padding: 0.75rem;
`;

const ButtonStyled = styled(Button)`
  cursor: pointer;
`;

const ImageGridContainer = styled(Grid)`
  align-items: start;
  justify-items: center;
  grid-template-columns: repeat(2, minmax(0px, 1fr));
  @container (min-width: 300px) {
    grid-template-columns: repeat(3, minmax(0px, 1fr));
  }
  @container (min-width: 400px) {
    grid-template-columns: repeat(4, minmax(0px, 1fr));
  }
  @container (min-width: 500px) {
    grid-template-columns: repeat(5, minmax(0px, 1fr));
  }
`;

const addSpaceBeforeCapitalLetters = (inputString: string): string =>
	inputString
		.replace(/([A-Z])/g, " $1")
		.trim()
		.charAt(0)
		.toUpperCase() +
	inputString
		.replace(/([A-Z])/g, " $1")
		.trim()
		.slice(1);

export function IconSelectComponent(props: IconInputProps): ReactElement {
	const {
		elementProps,
		onChange,
		value = "",
		schemaType: { options },
	} = props;

	const iconOptions = options as IconOptions | undefined;

	const backgroundColor = iconOptions?.backgroundColor ?? "white";
	const iconList = iconOptions?.list ?? [];
	let iconsPath = iconOptions?.path ?? "";
	// Add / to the end of the path if it's not there
	if (!iconsPath.endsWith("/")) {
		iconsPath += "/";
	}

	const [open, setOpen] = useState(false);
	const onClose = useCallback(() => setOpen(false), []);
	const onOpen = useCallback(() => setOpen(true), []);

	const [search, setSearch] = useState("");

	const icons = search
		? iconList.filter((icon) => icon.value.includes(search.toLowerCase()))
		: iconList;

	const onSearchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSearch(event.currentTarget.value);
		},
		[setSearch],
	);

	const onIconChange = useCallback(
		(icon: string) => {
			onChange(icon ? set(icon) : unset());
			onClose();
		},
		[onChange, onClose],
	);

	const onIconRemove = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			onChange(unset());
		},
		[onChange],
	);

	return (
		<>
			<Flex {...elementProps} align="center" gap={4} onClick={onOpen}>
				{value ? (
					<FlexContainer
						align="center"
						justify="space-between"
						gap={4}
						padding={3}
					>
						<Flex align="center" gap={3}>
							<IconContainer
								paddingX={2}
								paddingY={1}
								style={{ backgroundColor }}
							>
								<img
									alt="icon"
									style={{
										height: "24px",
										width: "24px",
									}}
									src={`${iconsPath}${value}.svg`}
								/>
							</IconContainer>
							<Text>{addSpaceBeforeCapitalLetters(value)}</Text>
						</Flex>
						<ButtonStyled
							onClick={onIconRemove}
							icon={TrashIcon}
							tone="critical"
						/>
					</FlexContainer>
				) : (
					<FlexContainer
						align="center"
						gap={4}
						padding={3}
						justify="space-between"
					>
						<Text>Click to select an icon</Text>
						<ButtonStyled onClick={onOpen} icon={AddCircleIcon} />
					</FlexContainer>
				)}
			</Flex>
			{open && (
				<Dialog
					header="Icons"
					id="dialog-icons"
					onClose={onClose}
					zOffset={1000}
					width={100}
				>
					<Box padding={4} style={{ containerType: "inline-size" }}>
						<TextInput
							icon={SearchIcon}
							onChange={onSearchChange}
							placeholder="Search for an icon"
							value={search}
						/>
						<ImageGridContainer padding={4}>
							{icons.map((icon) => {
								if (!icon) return null;
								return (
									<Flex
										align="flex-start"
										direction="column"
										gap={4}
										key={icon.value}
										// eslint-disable-next-line react/jsx-no-bind
										onClick={() => onIconChange(icon.value)}
										value={icon.value}
									>
										<BlockVariantCard
											icon={icon.value}
											iconsPath={iconsPath}
											backgroundColor={backgroundColor}
										/>
									</Flex>
								);
							})}
						</ImageGridContainer>
					</Box>
				</Dialog>
			)}
		</>
	);
}

const IconStyles = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	borderRadius: 4,
	cursor: "pointer",
	height: "32px",
	margin: "0 auto",
	marginBottom: "8px",
	padding: "4px",
	width: "32px",
	maxWidth: "unset",
	verticalAlign: "unset",
};

function BlockVariantCard({
	icon,
	iconsPath,
	backgroundColor,
}: {
	icon: string;
	iconsPath: string;
	backgroundColor: string;
}) {
	return (
		<BlockVariantCardContainer>
			<img
				className="select-icon"
				src={`${iconsPath}${icon}.svg`}
				style={{ ...IconStyles, backgroundColor }}
			/>
			<Text style={{ textAlign: "center" }} size={0}>
				{addSpaceBeforeCapitalLetters(icon)}
			</Text>
		</BlockVariantCardContainer>
	);
}
