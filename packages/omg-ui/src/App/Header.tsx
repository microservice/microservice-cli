import React from 'react'

import { Box, Row } from '~/components/flex'

export default function Header() {
  return (
    <Row flex={1} justifyContent="space-between">
      <Box>
        <span>Logo</span>
      </Box>
      <Row>
        <Box>
          <span>Rebuilding</span>
        </Box>
        <Box>
          <span>Compleness</span>
        </Box>
      </Row>
      <Box>
        <span>Contribute on Github</span>
      </Box>
    </Row>
  )
}
