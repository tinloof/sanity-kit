import React from "react";

import { CopyIcon, EllipsisVerticalIcon, TrashIcon } from "@sanity/icons";
import { Button, Flex, Menu, MenuButton, MenuItem } from "@sanity/ui";
import { useCallback, useContext } from "react";
import { type ObjectItemProps } from "sanity";
import styled from "styled-components";
import { SectionsContext } from "./SectionsContext";
import { generateItemKey } from "./utils";

const MENU_BUTTON_POPOVER_PROPS = { portal: true, tone: "default" } as const;

// Hides the default menu for array items
const WrapperFlex = styled(Flex)`
  padding-right: 1rem;

  > *:first-child {
    flex: 1;

    *[data-ui="MenuButton"] {
      display: none;
    }

    div[data-testid="change-bar"] {
      transform: translateX(2.25em);
    }
  }
`;

export function SectionArrayItem(props: ObjectItemProps) {
  const { openSectionPicker } = useContext(SectionsContext);
  const { inputId, onRemove, value, onInsert } = props;

  function addItem(position: "before" | "after") {
    function onItemAdd(newItem: any) {
      onInsert({
        position,
        items: [newItem],
      });
    }
    openSectionPicker(onItemAdd);
  }

  const handleDuplicate = useCallback(() => {
    if (value)
      onInsert({
        position: "after",
        items: [
          {
            ...value,
            _key: generateItemKey(),
          },
        ],
      });
  }, [onInsert, value]);

  return (
    <WrapperFlex align="center">
      {props.renderDefault(props)}
      {/* Adapted from: https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/form/inputs/arrays/ArrayOfPrimitivesInput/ItemRow.tsx#L62 */}
      <MenuButton
        button={<Button padding={2} mode="bleed" icon={EllipsisVerticalIcon} />}
        id={`${inputId}-menuButtonOfficial`}
        popover={MENU_BUTTON_POPOVER_PROPS}
        menu={
          <Menu>
            <MenuItem
              text="Remove"
              tone="critical"
              icon={TrashIcon}
              onClick={onRemove}
            />

            <MenuItem
              text="Duplicate"
              icon={CopyIcon}
              onClick={handleDuplicate}
            />
            <MenuItem
              text="Add item before"
              onClick={() => addItem("before")}
            />
            <MenuItem text="Add item after" onClick={() => addItem("after")} />
          </Menu>
        }
      />
    </WrapperFlex>
  );
}
