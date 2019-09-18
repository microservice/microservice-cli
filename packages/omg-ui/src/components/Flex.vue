<template>
  <div :style="componentStyle">
    <slot />
  </div>
</template>

<script lang="ts">
import * as colors from '~/theme/colors'

type PropsFlex = {
  row?: boolean
  column?: boolean
  flex?: number

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

  justifyContent?: string
  alignItems?: string
  backgroundColor?: string
  color?: string
}

const PROPS_NAMES_MAP: Record<string, string[]> = {
  p: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  pv: ['paddingTop', 'paddingBottom'],
  ph: ['paddingLeft', 'paddingRight'],
  pt: ['paddingTop'],
  pr: ['paddingRight'],
  pb: ['paddingBottom'],
  pl: ['paddingLeft'],
  m: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  mv: ['marginTop', 'marginBottom'],
  mh: ['marginLeft', 'marginRight'],
  mt: ['marginTop'],
  mr: ['marginRight'],
  ml: ['marginLeft'],
  mb: ['marginBottom'],
}
const PROP_NAMES_AS_IS: string[] = ['flex', 'justifyContent', 'alignItems']

function propsToStyles(props: Partial<PropsFlex>) {
  const styles: Record<string, any> = { display: 'flex' }

  Object.keys(PROPS_NAMES_MAP).forEach(propName => {
    let value = props[propName]
    if (typeof value === 'undefined') {
      return
    }
    const keys = PROPS_NAMES_MAP[propName]
    if (typeof value === 'number') {
      value = `${value * 8}px`
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
  PROP_NAMES_AS_IS.forEach(propName => {
    const value = props[propName]
    if (typeof value === 'undefined') {
      return
    }
    styles[propName] = value
  })

  if (props.row) {
    styles.flexDirection = 'row'
  } else if (props.column) {
    styles.flexDirection = 'column'
  }

  if (props.backgroundColor) {
    styles.backgroundColor = colors[props.backgroundColor]
  }
  if (props.color) {
    styles.color = colors[props.color]
  }

  return styles
}

export default {
  props: {
    row: { type: Boolean },
    column: { type: Boolean },

    flex: { type: Number },
    pv: { type: Number },
    pt: { type: Number },
    pb: { type: Number },
    ph: { type: Number },
    pl: { type: Number },
    pr: { type: Number },
    p: { type: Number },
    mv: { type: Number },
    mt: { type: Number },
    mb: { type: Number },
    mh: { type: Number },
    ml: { type: Number },
    mr: { type: Number },
    m: { type: Number },
    justifyContent: { type: String },
    alignItems: { type: String },
    backgroundColor: { type: String },
    color: { type: String },
  },
  data(cc) {
    return { componentStyle: propsToStyles(cc._props) }
  },
}
</script>
