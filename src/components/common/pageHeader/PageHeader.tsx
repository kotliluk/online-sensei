// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'
import './PageHeader.scss'
import { CheckBox } from '../../atoms/checkBox/CheckBox'
import { useSelector } from '../../../redux/useSelector'
import { selectTheme } from '../../../redux/page/selector'
import { useDispatch } from '../../../redux/useDispatch'
import { setTheme } from '../../../redux/page/actions'


export const PageHeader = (): JSX.Element => {
  const theme = useSelector(selectTheme)

  const dispatch = useDispatch()

  const handleThemeChange = useCallback((isDark: boolean) => {
    dispatch(setTheme(isDark ? 'dark' : 'light'))
  }, [dispatch])

  return (
    <header className='page-header'>
      <Link to='/' className='home-link'>OnlineSensei</Link>
      <div>
        <span>Dark theme:</span>
        <CheckBox checked={theme === 'dark'} onChange={handleThemeChange} />
      </div>
    </header>
  )
}
