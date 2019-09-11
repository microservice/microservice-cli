/* eslint-disable @typescript-eslint/no-empty-interface */
// TODO: Disable ^ that temporary override

import React from 'react'

import Text from '~/components/Text'
import { Box, Row } from '~/components/flex'

interface Props {}
interface State {}

export default class App extends React.Component<Props, State> {
  public render() {
    return (
      <Box backgroundColor="white">
        <Row ph={2} pv={1}>
          <Box>
            <Row>
              <img src={require('~/images/logo.png')} width={24} height={24} />
              <Text size="large" color="blue">
                Open Microservice Guide
              </Text>
            </Row>
          </Box>
        </Row>
      </Box>
    )
  }
}
