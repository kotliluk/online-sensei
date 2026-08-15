/**
 * The click only starts the download, so the object URL has to stay resolvable
 * until the browser has read it. Desktop browsers are done within a tick,
 * Safari on iOS is not, and a revoked URL there means a download that silently
 * produces nothing. The blob is a few kilobytes, so holding it is cheap.
 */
const REVOKE_DELAY = 40000

/**
 * Hands a generated file to the browser as a download.
 *
 * The anchor is put into the document before it is clicked, because Firefox
 * ignores a click on a detached element.
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

  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY)
}
