import { JSX } from 'react'
import { Link } from 'react-router-dom'
import './PageHeader.scss'
import { OSIcon } from '../../icons/OSIcon'
import { SettingsMenu } from '../settingsMenu/SettingsMenu'


/**
 * The logo is a working way home on every screen. On the ones with something to lose it
 * does not go quietly - `LeaveGuard` holds the navigation and asks first, with the same
 * question the browser's own back gets. Nothing here has to know which screens those are,
 * which is why this component went back to being what it was.
 */
export const PageHeader = (): JSX.Element => {
  return (
    <header className='page-header'>
      <Link to='/' className='home-link'>
        <OSIcon className='logo' />
        OnlineSensei
      </Link>

      <SettingsMenu />
    </header>
  )
}
