export interface IconProps {
  className?: string
  height?: number
  width?: number
}

export interface IconPropsWithFill extends IconProps {
  fill?: string
}

export interface IconPropsWithStroke extends IconPropsWithFill {
  stroke?: string
  'stroke-width'?: number
}
