import {
  ChevronRightIcon,
  DocumentIcon,
  EditIcon,
  FolderIcon,
  PublishIcon,
  SearchIcon,
} from "@sanity/icons";
import {
  usePresentationNavigate,
  usePresentationParams,
} from "@sanity/presentation";
import { Badge, Box, Card, Flex, Stack, Text, Tooltip } from "@sanity/ui";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { createElement, useRef } from "react";
import { useColorSchemeValue, useSchema } from "sanity";
import { styled } from "styled-components";

import {
  FoldersConfig,
  ListItemProps,
  PageTreeNode,
  TreeNode,
} from "../../../types";
import { useNavigator } from "../context";
import { PreviewElement } from "./Preview";

type PreviewStyleProps = {
  isPreviewed?: boolean;
  currentScheme?: string;
};

const ListWrapper = styled(Box)`
  border: 2px solid transparent;
  padding: 2px;
  border-radius: 8px;
  height: 88vh;
  overflow-y: auto;
  margin: 0;
  display: flex;
  gap: 0.25rem;
  flex-direction: column;
`;

const ListItemWrapper = styled(Stack)<PreviewStyleProps>`
  --bg-selected: ${(props) =>
    props.currentScheme === "light" ? "#D5E2FB" : "#26344B"};
  --fg-selected: ${(props) =>
    props.currentScheme === "light" ? "#20386B" : "#B2CBF9"};
  --hover-bg: ${(props) =>
    props.currentScheme === "light" ? "#F2F3F5" : "#2A2C30"};

  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) =>
    !props.isPreviewed ? "var(--card-bg-color)" : "var(--bg-selected)"};
  color: ${(props) => (!props.isPreviewed ? "inherit" : "var(--fg-selected)")};
  transition: background-color 0.2s ease-in-out;
  border: 2px solid transparent;
  min-height: 33px;

  &:focus-visible {
    outline: none;
    background-color: var(--hover-bg);
  }

  &:hover {
    background-color: var(--hover-bg);
  }

  & > span[data-border] {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    box-shadow: inset 0 0 0 1px var(--card-fg-color);
    opacity: 0.1;
    border-radius: inherit;
    pointer-events: none;
`;

const TextContainer = styled(Stack)`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
`;

const TextElement = styled(Text)<PreviewStyleProps>`
  --fg-selected: ${(props) =>
    props.currentScheme === "light" ? "#20386B" : "#B2CBF9"};

  ${(props) => (!props.isPreviewed ? "" : "color: var(--fg-selected)")};
`;

const PublishIconContainer = styled(Text)<PreviewStyleProps>`
  --published: ${(props) =>
    props.currentScheme === "light" ? "#3e7147;" : "#8fd89f"};

  padding: 0 8px;
  opacity: ${(props) => (props.muted ? 0.3 : 1)};
  color: ${(props) => (props.muted ? "inherit" : "var(--published)")};
`;
const EditIconContainer = styled(Text)<PreviewStyleProps>`
  --edited: ${(props) =>
    props.currentScheme === "light" ? "#716327" : "#F5D456"};

  padding: 0 8px;
  opacity: ${(props) => (props.muted ? 0.3 : 1)};
  color: ${(props) => (props.muted ? "inherit" : "var(--edited)")};
`;

const SkeletonIcon = styled.div<PreviewStyleProps>`
  width: 50px;
  height: 44px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.currentScheme === "light" ? "#F2F3F5" : "#2A2C30"};
  color: inherit;
`;

const SkeletonTitle = styled.div<PreviewStyleProps>`
  width: 60%;
  height: 10px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.currentScheme === "light" ? "#F2F3F5" : "#2A2C30"};
  color: inherit;
`;

const SkeletonSubtitle = styled.div<PreviewStyleProps>`
  width: 50px;
  height: 8px;
  border-radius: 2px;
  background-color: ${(props) =>
    props.currentScheme === "light" ? "#F2F3F5" : "#2A2C30"};
  color: inherit;
`;

const List = ({ loading }: { loading: boolean }) => {
  const { items } = useNavigator();
  const innerRef = useRef<HTMLUListElement>(null);
  const { preview } = usePresentationParams();
  const activeDescendantIndex =
    items.findIndex((item) => item.pathname === preview) ?? 0;
  const [activeDescendant, setActiveDescendant] = React.useState(
    `item-${activeDescendantIndex}`
  );

  const virtualizer = useVirtualizer({
    count: items.length,
    estimateSize: () => 40, // estimate individual item size
    getScrollElement: () => innerRef.current,
    overscan: 25,
  });

  if (loading) {
    return <SkeletonListItems items={40} />;
  }

  return !items.length ? (
    <EmptySearchResults />
  ) : (
    <Card padding={1}>
      <ListWrapper
        id="navigator-list"
        ref={innerRef}
        as="ul"
        role="listbox"
        aria-label="Pages and folders"
        aria-activedescendant={`item-${activeDescendant}`}
      >
        {virtualizer.getVirtualItems().map((virtualChild) => {
          const item = items[virtualChild.index];
          return (
            <ListItem
              key={virtualChild.index}
              item={item}
              active={activeDescendant}
              setActive={setActiveDescendant}
              idx={virtualChild.index}
              virtualChild={virtualChild}
            />
          );
        })}
      </ListWrapper>
    </Card>
  );
};

const ListItem = ({ item, active, setActive, idx }: ListItemProps) => {
  const {
    defaultLocaleId,
    setCurrentDir,
    currentDir,
    locale,
    localizePathname,
    folders,
  } = useNavigator();
  const schema = useSchema();
  const innerRef = useRef<HTMLLIElement>(null);
  const listItemId = `item-${idx}`;
  const path = localizePathname({
    pathname: item.pathname || "",
    localeId: item.locale,
    isDefault: defaultLocaleId === item.locale,
    fallbackLocaleId: locale,
  });

  const scheme = useColorSchemeValue();
  const { preview } = usePresentationParams();
  const navigate = usePresentationNavigate();
  const previewed = preview === path;

  const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
    e.preventDefault();
    if (item._type !== "folder") {
      navigate(path, {
        type: item._type,
        id: item._id,
      });
    } else {
      setCurrentDir(item.pathname || "");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (item._type !== "folder") {
        navigate(path);
      } else {
        setCurrentDir(path);
      }
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const target =
        event.key === "ArrowUp"
          ? "previousElementSibling"
          : "nextElementSibling";
      const sibling = event.currentTarget[target] as HTMLLIElement;

      if (!sibling) return;

      setActive?.(sibling.id);
      sibling.focus();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (currentDir !== "") {
        setCurrentDir(currentDir.split("/").slice(0, -1).join("/"));
      }
    }
  };

  const schemaType = schema.get(item._type);

  if (item._type !== "folder" && !schemaType) {
    return null;
  }

  return (
    <ListItemWrapper
      ref={innerRef}
      id={listItemId}
      as="li"
      role="option"
      tabIndex={listItemId === active || item._type === "folder" ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={item.title}
      aria-selected={listItemId === active}
      currentScheme={scheme}
      isPreviewed={previewed}
    >
      <Flex align="center" gap={2} flex={1}>
        <Flex
          align="center"
          justify="center"
          style={{ position: "relative", width: 33, height: 33, flexShrink: 0 }}
        >
          <ItemIcon item={item} />
          <div
            style={{
              boxShadow: "inset 0 0 0 1px var(--card-fg-color)",
              opacity: 0.1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              display: "block",
            }}
          />
        </Flex>
        <TextContainer>
          <TextElement
            size={1}
            textOverflow="ellipsis"
            isPreviewed={previewed}
            currentScheme={scheme}
            weight="medium"
          >
            {item._type !== "folder" ? (
              <PreviewElement fallback={item.title} type="title" item={item} />
            ) : (
              <FolderTitle item={item} locale={locale} folders={folders} />
            )}
          </TextElement>
          <TextElement
            size={1}
            muted
            textOverflow="ellipsis"
            isPreviewed={previewed}
            currentScheme={scheme}
          >
            {item._type !== "folder" ? (
              <PreviewElement fallback={path} type="subtitle" item={item} />
            ) : (
              path
            )}
          </TextElement>
        </TextContainer>
      </Flex>
      {
        // If the item is a folder, show the chevron icon
        item._type === "folder" && (
          <Flex gap={2}>
            {Object.keys(item.children).length === 0 ? null : (
              <Badge mode="outline" fontSize={0}>
                {Object.keys(item.children).length}
              </Badge>
            )}
            <Tooltip
              content={
                <Box padding={2}>
                  <Text size={1}>Open folder</Text>
                </Box>
              }
              fallbackPlacements={["right", "left"]}
              placement="top"
              portal
            >
              <ChevronRightIcon />
            </Tooltip>
          </Flex>
        )
      }
      {item._type !== "folder" ? (
        <Flex gap={2}>
          <PublishIconContainer
            size={1}
            muted={
              item._id.startsWith("drafts.") &&
              item?._updatedAt === item?._createdAt
            }
            currentScheme={scheme}
            weight="bold"
          >
            <Tooltip
              content={
                <Box padding={2}>
                  <Text size={1}>
                    {item._id.startsWith("drafts.") &&
                    item?._updatedAt === item?._createdAt
                      ? "Not published yet"
                      : "Published"}
                  </Text>
                </Box>
              }
              fallbackPlacements={["right", "left"]}
              placement="top"
              portal
            >
              <PublishIcon />
            </Tooltip>
          </PublishIconContainer>
          <EditIconContainer
            size={1}
            muted={!(item as PageTreeNode).edited}
            currentScheme={scheme}
            weight="bold"
          >
            <Tooltip
              content={
                <Box padding={2}>
                  <Text size={1}>
                    {(item as PageTreeNode).edited
                      ? "Edited"
                      : "No unpublished edits"}
                  </Text>
                </Box>
              }
              fallbackPlacements={["right", "left"]}
              placement="top"
              portal
            >
              <EditIcon />
            </Tooltip>
          </EditIconContainer>
        </Flex>
      ) : null}
    </ListItemWrapper>
  );
};

const FolderTitle = ({
  item,
  locale,
  folders,
}: {
  item: TreeNode;
  locale: string | undefined;
  folders: FoldersConfig | undefined;
}) => {
  const customTitle = folders?.[item.pathname || ""]?.title;

  if (customTitle) {
    return (
      <>
        {typeof customTitle === "string"
          ? customTitle
          : customTitle(item, locale)}
      </>
    );
  }

  return <>{item.title}</>;
};

const ItemIcon = ({ item }: { item: TreeNode }) => {
  const { folders } = useNavigator();

  if (item._type === "folder") {
    return createElement(
      item.pathname && folders?.[item.pathname]?.icon
        ? folders[item.pathname].icon!
        : FolderIcon,
      {
        fontSize: "calc(21 / 16 * 1em)",
        color: "var(--card-icon-color)",
      }
    );
  }

  return (
    <PreviewElement fallback={<DocumentIcon />} type="media" item={item} />
  );
};

const SkeletonListItems = ({ items }: { items: number }) => {
  const scheme = useColorSchemeValue();

  return (
    <Card padding={1}>
      <ListWrapper>
        {[...Array(items)].map((key) => (
          <div role="listitem" aria-label="Loading item" key={key}>
            <Flex align="center" gap={3} padding={1}>
              <SkeletonIcon currentScheme={scheme} />
              <TextContainer>
                <SkeletonTitle currentScheme={scheme} />
                <SkeletonSubtitle currentScheme={scheme} />
              </TextContainer>
            </Flex>
          </div>
        ))}
      </ListWrapper>
    </Card>
  );
};

SkeletonListItems.displayName = "SkeletonListItems";

const EmptySearchResults = (_props: any) => {
  return (
    <Flex
      ref={_props.domRef}
      align="center"
      justify="center"
      padding={4}
      gap={1}
    >
      <SearchIcon />
      <Text muted>No results</Text>
    </Flex>
  );
};

EmptySearchResults.displayName = "EmptySearchResults";

export { EmptySearchResults, List, SkeletonListItems };
