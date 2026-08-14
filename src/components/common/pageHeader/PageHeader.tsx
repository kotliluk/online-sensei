import { JSX } from 'react'
import { Link } from 'react-router-dom'
import './PageHeader.scss'
import { OSIcon } from '../../icons/OSIcon'
import { SettingsMenu } from '../settingsMenu/SettingsMenu'


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
