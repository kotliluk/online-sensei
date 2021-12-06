// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Link } from 'react-router-dom'
import './PageHeader.scss'
import { config } from '../../../config'
import { OSIcon } from '../../icons/OSIcon'
import { SettingsMenu } from '../settingsMenu/SettingsMenu'


export const PageHeader = (): JSX.Element => {
  return (
    <header className='page-header'>
      <Link to={config.basename} className='home-link'>
        <OSIcon className='logo' />
        OnlineSensei
      </Link>

      <SettingsMenu />
    </header>
  )
}
