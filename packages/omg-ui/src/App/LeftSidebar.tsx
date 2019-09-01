import React from 'react'

import { Box, Row } from '~/components/flex'

export default function LeftSidebar() {
  return (
    <Box>
      <Box>
        <span>History</span>
        <input placeholder="Search" />
      </Box>
      <Box>
        <Row>
          <span>Clear All</span>
        </Row>
        <Row>
          <span>Today</span>
          <span>/getAllUsers</span>
        </Row>
      </Box>
    </Box>
  )
}
