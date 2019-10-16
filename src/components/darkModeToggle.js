import React, { useCallback, useMemo } from 'react'
import Toggle from 'react-toggle'
import { useDarkMode } from '../utils/useDarkMode'
import './darkModeToggle.css'

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode()
  const isChecked = useMemo(() => {
    return darkMode === 'dark'
  }, [darkMode])

  const handleToggleDarkMode = useCallback(event => {
    const checked = event.target.checked
    const updatedMode = checked ? 'dark' : 'light'
    toggleDarkMode(updatedMode)
  }, [toggleDarkMode])

  return (
    <div style={{height: 24}}>
      <Toggle checked={isChecked} onChange={handleToggleDarkMode} />
    </div>
  )
}

export default DarkModeToggle