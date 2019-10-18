<template>
  <div :style="componentStyle" v-on="parentListeners">
    <slot />
  </div>
</template>

<script lang="ts">
import * as colors from '~/theme/colors'

interface PropsFlex {
  row?: boolean
  column?: boolean

  p?: number
  pv?: number
  ph?: number
  pt?: number
  pr?: number
  pb?: number
  pl?: number
  m?: number
  mv?: number
  mh?: number
  mt?: number
  mr?: number
  mb?: number
  ml?: number
  b?: number
  bv?: number
  bh?: number
  bt?: number
  br?: number
  bb?: number
  bl?: number

  backgroundColor?: string
  bordercolor?: string
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
  mb: ['marginBottom'],
  ml: ['marginLeft'],
  b: ['borderTop', 'borderRight', 'borderBottom', 'borderLeft'],
  bv: ['borderTop', 'borderBottom'],
  bh: ['borderLeft', 'borderRight'],
  bt: ['borderTop'],
  br: ['borderRight'],
  bb: ['borderBottom'],
  bl: ['borderLeft'],
}

const COLOR_BORDER = colors.grey20

function propsToStyles(props: Partial<PropsFlex>, extraProps: Record<string, any>) {
  let paddingHeight = 0
  const styles: Record<string, any> = { display: 'flex' }
  const borderColor = props.bordercolor ? colors[props.bordercolor] : COLOR_BORDER

  Object.keys(PROPS_NAMES_MAP).forEach(propName => {
    const isPropBorder = propName.startsWith('b')

    let value = props[propName]
    if (typeof value === 'undefined') {
      return
    }
    const keys = PROPS_NAMES_MAP[propName]
    if (isPropBorder) {
      value = `${value}px solid ${borderColor}`
    } else if (typeof value === 'number') {
      value = `${value * 8}px`
    }

    if (!keys) {
      // If not found, pass on as-is
      styles[propName] = props[propName]
      return
    }
    keys.forEach(keyName => {
      if (PROPS_NAMES_MAP.pv.includes(keyName)) {
        paddingHeight += props[propName] * 8
      }
      styles[keyName] = value
    })
  })

  if (props.row) {
    styles.flexDirection = 'row'
  } else if (props.column) {
    styles.flexDirection = 'column'
    if (!styles.height) {
      styles.height = paddingHeight > 0 ? `calc(100% - ${paddingHeight}px)` : '100%'
    }
  }

  if (props.backgroundColor) {
    styles.backgroundColor = colors[props.backgroundColor]
  }
  if (props.color) {
    styles.color = colors[props.color]
  }

  return { ...styles, ...extraProps }
}

export default {
  inheritAttrs: false,

  props: {
    row: { type: Boolean },
    column: { type: Boolean },

    p: { type: Number },
    pv: { type: Number },
    ph: { type: Number },
    pt: { type: Number },
    pr: { type: Number },
    pb: { type: Number },
    pl: { type: Number },
    m: { type: Number },
    mv: { type: Number },
    mh: { type: Number },
    mt: { type: Number },
    mr: { type: Number },
    mb: { type: Number },
    ml: { type: Number },
    b: { type: Number },
    bv: { type: Number },
    bh: { type: Number },
    bt: { type: Number },
    br: { type: Number },
    bb: { type: Number },
    bl: { type: Number },
    backgroundColor: { type: String },
    bordercolor: { type: String },
    color: { type: String },
  },
  data(cc) {
    return { componentStyle: propsToStyles(cc._props, cc.$attrs) }
  },
  computed: {
    parentListeners() {
      return {
        ...this.$listeners,
      }
    },
  },
}
</script>
