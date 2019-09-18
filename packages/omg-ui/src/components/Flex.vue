<template>
  <div :style="componentStyle">
    <slot />
  </div>
</template>

<script lang="ts">
type PropsFlex = {
  row?: boolean
  column?: boolean

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
}

const PROPS_NAMES_MAP: Record<keyof PropsFlex, string[]> = {
  row: [],
  column: [],

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
  const styles: Record<string, any> = { display: 'flex' }

  Object.keys(PROPS_NAMES_MAP).forEach(propName => {
    let value = props[propName]
    if (typeof value === 'undefined') {
      return
    }
    const keys = PROPS_NAMES_MAP[propName]
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

  if (props.row) {
    styles.flexDirection = 'row'
  } else if (props.column) {
    styles.flexDirection = 'column'
  }

  return styles
}

export default {
  props: {
    row: { type: Boolean },
    column: { type: Boolean },

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
  },
  data(cc) {
    return { componentStyle: propsToStyles(cc._props) }
  },
}
</script>
