import {
  Card,
  Flex,
  Stack,
  studioTheme,
  Text,
  ThemeProvider,
} from "@sanity/ui";
import React from "react";
import { useColorSchemeValue } from "sanity";
import styled from "styled-components";

import { SectionAddHandler, SectionVariantType } from "../../types";

type SectionVariantCardWrapperProps = {
  currentScheme?: string;
};

const SectionVariantCardWrapper = styled(Card)<SectionVariantCardWrapperProps>`
  --hover-bg: ${(props) =>
    props.currentScheme === "light" ? "#F2F3F5" : "#2A2C30"};

  all: initial;
  padding: 0.75em;
  border-radius: 0.1875rem;

  &:hover {
    background: var(--hover-bg);
    cursor: pointer;
  }

  &[data-has-asset="true"] {
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 0.75rem;
  }
  &[data-has-asset="false"] {
    display: block;
    border: 1px solid var(--card-border-color);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const SectionAssetWrapper = styled.div`
  max-height: 400px;
  height: 100%;
  width: 100%;

  & img,
  video {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: top left;
    border: 1px solid var(--card-border-color);
    overflow: hidden;
  }
`;

function SectionVariantCard({
  sectionVariant,
  onSectionAdd,
}: {
  sectionVariant: SectionVariantType;
  onSectionAdd: SectionAddHandler;
}) {
  const scheme = useColorSchemeValue();

  return (
    <SectionVariantCardWrapper
      role="button"
      tone="transparent"
      data-has-asset={!!sectionVariant.assetUrl}
      padding={2}
      radius={2}
      style={{ position: "relative" }}
      onClick={() => onSectionAdd(sectionVariant)}
      currentScheme={scheme}
    >
      {sectionVariant?.assetUrl ? (
        <>
          <Text size={1} weight="bold">
            {sectionVariant.title}
          </Text>
          <SectionAssetWrapper>
            {/\.mp4$|\.mov$|\.avi$|\.wmv$|\.flv$|\.mkv$/.test(
              sectionVariant.assetUrl
            ) ? (
              <video
                muted
                loop
                autoPlay
                src={sectionVariant.assetUrl}
                aria-label={sectionVariant.title}
              />
            ) : (
              <img
                style={{
                  "object-fit": "cover",
                  height: "100%",
                  objectPosition: "center",
                }}
                src={sectionVariant.assetUrl}
                alt={sectionVariant.title}
              />
            )}
          </SectionAssetWrapper>
        </>
      ) : (
        <Flex style={{ height: "100%" }} justify="center" align="center">
          <Text size={1} weight="bold" align="center">
            {sectionVariant.title}
          </Text>
        </Flex>
      )}
    </SectionVariantCardWrapper>
  );
}

export function SectionPicker({
  onSectionAdd,
  filteredSectionVariants,
}: {
  onSectionAdd: SectionAddHandler;
  filteredSectionVariants: SectionVariantType[];
}) {
  const scheme = useColorSchemeValue();
  const Wrapper = styled.div`
    height: 450px;
    @media only screen and (min-width: 768px) {
      height: 650px;
    }
  `;
  return (
    <ThemeProvider theme={studioTheme}>
      <Wrapper>
        <Stack space={2} padding={3}>
          <Grid>
            {filteredSectionVariants.map((sectionVariant) => (
              <SectionVariantCard
                key={sectionVariant.title}
                sectionVariant={sectionVariant}
                onSectionAdd={onSectionAdd}
              />
            ))}
          </Grid>
        </Stack>
      </Wrapper>
    </ThemeProvider>
  );
}
