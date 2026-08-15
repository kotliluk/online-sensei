/**
 * Gets a generated file to the user, either through the system share sheet or
 * as a plain download.
 *
 * Which one is better depends on the device, not on the browser. On a desktop
 * the download folder is where a file belongs and the share sheet is a detour;
 * on a phone it is the other way round - a downloaded file means opening the
 * files app, finding it and sharing it from there, while the share sheet hands
 * it straight to Sheets, Drive or a chat, and still offers saving it.
 *
 * Sharing needs a secure context, so over plain http (a dev server on the local
 * network, for instance) this always falls back to the download.
 */

/**
 * The click only starts the download, so the object URL has to stay resolvable
 * until the browser has read it. Desktop browsers are done within a tick,
 * Safari on iOS is not, and a revoked URL there means a download that silently
 * produces nothing. The blob is a few kilobytes, so holding it is cheap.
 */
const REVOKE_DELAY = 40000

/** Touch-first devices, where the share sheet is the shorter way. */
const isTouchFirst = (): boolean => window.matchMedia('(pointer: coarse)').matches

/**
 * canShare() answers per payload - a browser can share text and still refuse
 * files, and it filters by type - so it has to be asked with a representative
 * file rather than about the feature as a whole.
 */
const canShareFile = (file: File): boolean => {
  return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
}

/** Whether {@link exportFile} will share a file of this type instead of downloading it. */
export const willShareFile = (mimeType: string): boolean => {
  return isTouchFirst() && canShareFile(new File([''], 'probe', { type: mimeType }))
}

const downloadFile = (file: File): void => {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')

  link.href = url
  link.download = file.name
  link.style.display = 'none'

  // Firefox ignores a click on a detached element
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY)
}

export const exportFile = (file: File): void => {
  if (!isTouchFirst() || !canShareFile(file)) {
    downloadFile(file)
    return
  }

  navigator.share({ files: [file] }).catch((error: Error) => {
    // dismissing the share sheet is a decision, not a failure to recover from
    if (error.name !== 'AbortError') {
      downloadFile(file)
    }
  })
}
