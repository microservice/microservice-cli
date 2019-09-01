/* eslint-disable @typescript-eslint/no-empty-interface */
// TODO: Disable ^ that temporary override

import React from 'react'
import { Box, Row } from '~/components/flex'

import Header from './Header'
import Footer from './Footer'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import Actions from './Actions'

interface Props {}
interface State {}

export default class App extends React.Component<Props, State> {
  public render() {
    return (
      <Box p={2}>
        <Row pb={2}>
          <Header />
        </Row>
        <Row pb={2}>
          <Box flex={1}>
            <LeftSidebar />
          </Box>
          <Box flex={3}>
            <Actions />
          </Box>
          <Box flex={1}>
            <RightSidebar />
          </Box>
        </Row>
        <Row>
          <Footer />
        </Row>
      </Box>
    )
  }
}
