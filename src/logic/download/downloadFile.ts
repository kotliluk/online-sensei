/**
 * Hands a generated file to the browser as a download.
 *
 * The anchor is put into the document before it is clicked - Firefox ignores a
 * click on a detached element - and the object URL is released on the next tick
 * rather than right after the click, because the click only starts the
 * download and the URL has to stay resolvable until the browser has read it.
 */
export const downloadTextFile = (fileName: string, content: string, mimeType: string): void => {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => URL.revokeObjectURL(url), 0)
}
