import {AddIcon, ArrowLeftIcon, HomeIcon} from "@sanity/icons";
import {
	Button,
	Card,
	Flex,
	Menu,
	MenuButton,
	MenuItem as MenuItemComponent,
	Text,
} from "@sanity/ui";
import {type ReactElement, useCallback} from "react";
import {useSchema} from "sanity";
import {useIntentLink} from "sanity/router";

import type {HeaderProps, NormalizedCreatablePage} from "../../../types";
import {useNavigator} from "../context";
import {getTemplateName, pathnameToTitle} from "../utils";
import TooltipWrapper from "./ToolTipWrapper";

const Header = ({pages, domRef, children}: HeaderProps): ReactElement => {
	const {currentDir, setCurrentDir, locale} = useNavigator();

	const back = useCallback(() => {
		if (currentDir) {
			setCurrentDir(currentDir.split("/").slice(0, -1).join("/") || "");
		}
	}, [currentDir, setCurrentDir]);

	const backToRoot = useCallback(() => {
		setCurrentDir("");
	}, [setCurrentDir]);

	return (
		<Card
			ref={domRef}
			borderBottom
			paddingX={1}
			paddingTop={3}
			paddingBottom={1}
			flex={1}
		>
			<Flex paddingX={1} paddingBottom={3} flex={1} justify="space-between">
				<Card>
					<Flex align="center" gap={2} width="100%">
						<Button
							mode="bleed"
							icon={
								<ArrowLeftIcon viewBox="2.5 6 20 20" height={18} width={24} />
							}
							padding={2}
							disabled={currentDir === ""}
							onClick={back}
						/>
						<Text size={1} weight="semibold">
							{resolveTitle(currentDir)}
						</Text>
					</Flex>
				</Card>
				<Flex align="center" gap={1}>
					{currentDir && (
						<TooltipWrapper tooltipText="Back to root">
							<Button
								fontSize={0}
								mode="bleed"
								tone="positive"
								icon={<HomeIcon />}
								onClick={backToRoot}
							/>
						</TooltipWrapper>
					)}
					{!!pages?.length && (
						<MenuButton
							id="create-new-page"
							button={<Button fontSize={0} mode="bleed" icon={<AddIcon />} />}
							popover={{portal: true}}
							menu={
								<Menu>
									{pages?.map(({type, title}) => (
										<MenuItem
											page={{type, title}}
											locale={locale}
											currentDir={currentDir}
											key={type}
										/>
									))}
								</Menu>
							}
						/>
					)}
				</Flex>
			</Flex>
			<Flex align="center" wrap="wrap">
				{children}
			</Flex>
		</Card>
	);
};

Header.displayName = "Header";

export default Header;

function MenuItem(props: {
	locale: string | undefined;
	currentDir: string;
	page: NormalizedCreatablePage;
}) {
	const {locale, currentDir, page} = props;
	const {type, title} = page;
	const schema = useSchema();
	const schemaType = schema.get(type);
	const pathnameField =
		schemaType?.jsonType === "object"
			? schemaType.fields.find((field) => field.name === "pathname")
			: null;
	const pathnameCurrentInitialValue: string | undefined =
		pathnameField?.type.initialValue?.current;

	return (
		<MenuItemComponent
			{...useIntentLink({
				intent: "create",
				params: [
					{
						type,
						template: getTemplateName(type),
					},
					{
						pathname: getPathname({
							currentDir,
							initialValue: pathnameCurrentInitialValue,
						}),
						locale,
					},
				],
			})}
			as="a"
		>
			<Text size={1}>{title}</Text>
		</MenuItemComponent>
	);
}

function getPathname({
	currentDir,
	initialValue,
}: {
	currentDir: string;
	initialValue: string | undefined;
}) {
	if (initialValue !== undefined) {
		return initialValue;
	}

	if (currentDir) {
		return `${currentDir}/`;
	}

	return "/";
}

function resolveTitle(currentDir: string) {
	if (!currentDir) {
		return "Pages";
	}

	return pathnameToTitle(currentDir);
}
