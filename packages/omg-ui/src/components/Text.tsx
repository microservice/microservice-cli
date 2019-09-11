import React, { CSSProperties } from 'react'

import { colors, textSizes } from '~/theme'

type PropsFlex = {
  children: React.ReactNode
  color?: keyof typeof colors
  size?: keyof typeof textSizes
} & CSSProperties

function propsToStyles(props: Partial<PropsFlex>) {
  const styles: Record<string, any> = {}

  if (props.color) {
    styles.color = colors[props.color]
  }
  if (props.size) {
    const { lineHeight, fontSize } = textSizes[props.size]
    styles.fontSize = `${fontSize}px`
    styles.lineHeight = `${lineHeight}px`
  }

  return styles
}

export default function Text({ children, ...styles }: PropsFlex) {
  return <div style={propsToStyles(styles)}>{children}</div>
}
