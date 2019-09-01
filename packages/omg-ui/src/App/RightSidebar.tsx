import React from 'react'

import { Box, Row } from '~/components/flex'

export default function RightSidebar() {
  return (
    <Box>
      <Row>
        <button>Setup</button>
        <button>Edit the YAML</button>
      </Row>
      <Box>
        <span>Container Logs ....</span>
      </Box>
    </Box>
  )
}
