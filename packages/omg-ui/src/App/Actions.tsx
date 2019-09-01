import React from 'react'

import { Box, Row } from '~/components/flex'

export default function Actions() {
  return (
    <Box>
      <Row>
        <button>My first Action</button>
        <button>Custon Name</button>
        <button>+</button>
      </Row>
      <Row>
        <select>
          <option>Action/forward/subscription/...</option>
        </select>
        <button>Send</button>
      </Row>
      <Row>
        <Box flex={1}>
          <span>Payload</span>
        </Box>
        <Box flex={1}>
          <span>Result</span>
        </Box>
      </Row>
    </Box>
  )
}
