export interface IconProps {
  className?: string
  height?: number
  width?: number
  fill?: string
}

export interface IconPropsWithStroke extends IconProps {
  stroke?: string
  'stroke-width'?: number
}
