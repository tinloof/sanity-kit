import { AddIcon, ArrowLeftIcon, HomeIcon } from "@sanity/icons";
import {
  Button,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  Text,
} from "@sanity/ui";
import React from "react";

import { HeaderProps } from "../../../types";
import { useNavigator } from "../context";

import { useIntentLink } from "sanity/router";
import { getTemplateName, pathnameToTitle } from "../utils";
import TooltipWrapper from "./ToolTipWrapper";

const Header = ({ pages, domRef, children }: HeaderProps) => {
  const { currentDir, setCurrentDir, locale } = useNavigator();

  const back = () => {
    if (currentDir) {
      setCurrentDir(currentDir.split("/").slice(0, -1).join("/") || "");
    }
  };

  const backToRoot = () => {
    setCurrentDir("");
  };

  return (
    <>
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
                popover={{ portal: true }}
                menu={
                  <Menu>
                    {pages?.map(({ type, title }) => (
                      <MenuItem
                        key={type}
                        {...useIntentLink({
                          intent: "create",
                          params: [
                            {
                              type,
                              template: getTemplateName(type),
                            },
                            {
                              pathname: `${currentDir}/`,
                              locale,
                            },
                          ],
                        })}
                        as="a"
                      >
                        <Text size={1}>{title}</Text>
                      </MenuItem>
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
    </>
  );
};

Header.displayName = "Header";

export default Header;

function resolveTitle(currentDir: string) {
  if (!currentDir) {
    return "Pages";
  }

  return pathnameToTitle(currentDir);
}
