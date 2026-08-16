const pad = (value: number): string => value.toString().padStart(2, '0')

/**
 * `2026-08-15-0905` - what every exported file is stamped with.
 *
 * Local time, so the name matches the clock of whoever exported it rather than
 * a timezone they never see.
 */
export const fileNameStamp = (now: Date): string => {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    + `-${pad(now.getHours())}${pad(now.getMinutes())}`
}

/**
 * A tournament name reduced to what is safe in a file name.
 *
 * Accents are folded rather than kept: the name travels through a share sheet,
 * a downloads folder and whatever the receiving app does with it, and a file
 * that arrives as `kumite-kadeti-c-2026-08-15.csv` is still recognisable, while
 * one that arrives mangled is not. A name that folds away to nothing - emoji,
 * say - is left out of the file name entirely rather than leaving a stray dash.
 */
export const fileNameSlug = (name: string): string => {
  return name
    .normalize('NFD')
    // the combining marks that NFD just split off
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '')
}
