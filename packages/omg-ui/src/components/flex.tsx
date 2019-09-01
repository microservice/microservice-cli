import React, { CSSProperties } from 'react'

type PropsFlex = {
  children: React.ReactNode

  pv?: number
  pt?: number
  pb?: number
  ph?: number
  pl?: number
  pr?: number
  p?: number
  mv?: number
  mt?: number
  mb?: number
  mh?: number
  ml?: number
  mr?: number
  m?: number
} & CSSProperties

const PROPS_NAMES_MAP: Record<string, string[]> = {
  children: [],
  p: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  pv: ['paddingTop', 'paddingBottom'],
  ph: ['paddingLeft', 'paddingRight'],
  pt: ['paddingTop'],
  pr: ['paddingRight'],
  pb: ['paddingBottom'],
  pl: ['paddingLeft'],
  m: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  mv: ['margingTop', 'margingBottom'],
  mh: ['margingLeft', 'margingRight'],
  mt: ['margingTop'],
  mr: ['margingRight'],
  ml: ['margingLeft'],
  mb: ['margingBottom'],
}

function propsToStyles(props: Partial<PropsFlex>) {
  const styles: Record<string, any> = {}

  Object.keys(props).forEach(propName => {
    const keys = PROPS_NAMES_MAP[propName]
    let value = props[propName]
    if (typeof value === 'number') {
      value *= 8
    }

    if (!keys) {
      // If not found, pass on as-is
      styles[propName] = props[propName]
      return
    }
    if (!keys.length) {
      // If found and empty, ignore the item.
      // It's intentional.
      return
    }
    keys.forEach(keyName => {
      styles[keyName] = value
    })
  })

  return styles
}

export function Row({ children, ...styles }: PropsFlex) {
  return (
    <div
      style={{
        ...propsToStyles(styles),
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {children}
    </div>
  )
}

export function Box({ children, ...styles }: PropsFlex) {
  return (
    <div
      style={{
        ...propsToStyles(styles),
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}
