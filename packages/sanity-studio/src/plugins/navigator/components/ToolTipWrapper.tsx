import React from 'react'
import { Box, Text, Tooltip } from '@sanity/ui'

export default function TooltipWrapper({ children, tooltipText, ...rest }) {
  return (
    <Tooltip
      content={
        <Box padding={2}>
          <Text muted size={1}>
            {tooltipText}
          </Text>
        </Box>
      }
      fallbackPlacements={['right', 'left']}
      placement="top"
      portal
    >
      {children}
    </Tooltip>
  )
}
