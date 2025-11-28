import type {ComponentProps, ComponentType} from "react";
import {Box} from "@sanity/ui";
import {styled} from "styled-components";

const ConstrainedBox: ComponentType<ComponentProps<typeof Box>> = styled(Box)`
  max-width: 280px;
`;

export default ConstrainedBox;
