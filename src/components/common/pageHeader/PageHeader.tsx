import { JSX } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './PageHeader.scss'
import { OSIcon } from '../../icons/OSIcon'
import { SettingsMenu } from '../settingsMenu/SettingsMenu'
import { isGuardedPath } from '../../../logic/navigation/guardedPaths'


export const PageHeader = (): JSX.Element => {
  const { pathname } = useLocation()

  const sign = (
    <>
      <OSIcon className='logo' />
      OnlineSensei
    </>
  )

  /**
   * A span rather than an anchor without an href: an anchor is still a link to a screen
   * reader and still answers a click, so the only honest way to say "not a way out of
   * here" is to stop being one. Nothing else changes - `a` is styled `color: inherit`
   * with no underline, so the sign looks the same either way and only loses the cursor.
   */
  return (
    <header className='page-header'>
      {isGuardedPath(pathname)
        ? <span className='home-link'>{sign}</span>
        : <Link to='/' className='home-link'>{sign}</Link>}

      <SettingsMenu />
    </header>
  )
}
