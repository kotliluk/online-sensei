import { Box, padBox, PICTURE_PADDING, pictureScale } from './picture'


/**
 * Turns what is drawn on screen as svg into a png.
 *
 * The three things this has to get right were each found by measuring rather
 * than by reading, and each of them fails silently when left out.
 */

/**
 * Styles that reach the elements through the stylesheet rather than through
 * attributes, and are therefore lost the moment the copy leaves the document.
 *
 * The connecting lines of a bracket are the case that matters: a `<path>` there
 * carries neither `fill` nor `stroke` of its own, so a serialised copy falls
 * back to the default of `fill: black`, and every line is drawn as a filled
 * shape instead. `font-family` is the same story, more quietly - the names come
 * out in whatever the renderer picks when the stylesheet is gone.
 */
const INLINED_STYLES = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'font-weight']

const withInlinedStyles = (svg: SVGSVGElement): SVGSVGElement => {
  const copy = svg.cloneNode(true) as SVGSVGElement
  const sources = [svg as Element, ...Array.from(svg.querySelectorAll('*'))]
  const targets = [copy as Element, ...Array.from(copy.querySelectorAll('*'))]

  sources.forEach((source, i) => {
    const computed = getComputedStyle(source)
    const target = targets[i] as SVGElement

    INLINED_STYLES.forEach((property) => {
      target.style.setProperty(property, computed.getPropertyValue(property))
    })
  })

  return copy
}

/**
 * Where the content sits at its own size, with the panning and zooming ignored.
 *
 * The bracket on screen can be dragged and pinched, and d3 keeps that as a
 * transform on the root group. The picture deliberately does not follow it: a
 * download should give the same file whatever the last gesture happened to be,
 * and a bracket and its repechage are two separate svgs with two separate zoom
 * states, so following them meant the two halves of one picture came out at
 * different sizes. `getBBox()` answers from before that transform, which is
 * exactly the natural size wanted here - so the transform is dropped from the
 * copy rather than compensated for.
 */
const contentBox = (svg: SVGSVGElement): Box | null => {
  const root = svg.querySelector('g')

  return root === null ? null : padBox(root.getBBox(), PICTURE_PADDING)
}

const loadImage = (source: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = source
  })
}

type Rendered = { image: HTMLImageElement, width: number, height: number }

/**
 * One svg as an image, cropped to its content rather than to the window.
 *
 * A data url rather than a blob url on purpose: a blob url counts as a separate
 * origin for the canvas in some browsers and taints it, and a tainted canvas
 * cannot be read back at all.
 */
const renderSvg = async (svg: SVGSVGElement): Promise<Rendered | null> => {
  const box = contentBox(svg)

  if (!box || box.width <= 0 || box.height <= 0) {
    return null
  }

  const copy = withInlinedStyles(svg)
  const copyRoot = copy.querySelector('g')

  // the pan and zoom go with it, so the picture is of the bracket rather than
  // of the view somebody happened to leave the screen in
  copyRoot?.removeAttribute('transform')
  copyRoot?.style.removeProperty('transform')

  copy.setAttribute('width', String(box.width))
  copy.setAttribute('height', String(box.height))
  copy.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`)
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const markup = new XMLSerializer().serializeToString(copy)
  const image = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`)

  return image === null ? null : { image, width: box.width, height: box.height }
}

const toBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

/**
 * Several svgs stacked into one picture - a bracket has its repechage drawn
 * below it, and the picture keeps them together the way the screen does.
 *
 * The background is painted rather than left transparent, and it is painted
 * light whatever theme the app is in: the picture leaves for a chat, a print or
 * a file preview, and none of those inherit a dark theme. Left transparent, the
 * black text would land on whatever the viewer happens to use.
 */
export const svgsToPngBlob = async (svgs: SVGSVGElement[], background: string): Promise<Blob | null> => {
  const rendered = (await Promise.all(svgs.map(renderSvg))).filter((one) => one !== null)

  if (rendered.length === 0) {
    return null
  }

  const width = Math.max(...rendered.map((one) => one.width))
  const height = rendered.reduce((total, one) => total + one.height, 0)
  const scale = pictureScale(width, height)

  const canvas = document.createElement('canvas')

  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)

  const context = canvas.getContext('2d')

  if (context === null) {
    return null
  }

  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)

  let top = 0
  rendered.forEach((one) => {
    // centred, so a narrow repechage sits under the middle of the bracket
    const left = (width - one.width) / 2

    context.drawImage(one.image, left * scale, top * scale, one.width * scale, one.height * scale)
    top += one.height
  })

  return toBlob(canvas)
}
