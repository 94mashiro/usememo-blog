import React, { useState, createContext, useEffect } from 'react'

export const DarkModeContext = createContext({})

export const useDarkMode = ({
  lightClassName,
  darkClassName
} = {}) => {
  const currentMode = localStorage.getItem('mode') || 'light'
  const [darkMode, setDarkMode] = useState(currentMode)

  const effectBodyClass = mode => {
    const bodyClassName = (mode === 'light' ? lightClassName : darkClassName) || mode
    document.querySelector('body').setAttribute('class', bodyClassName)
  }

  useEffect(() => {
    effectBodyClass(currentMode)
  }, [])
  
  const toggleDarkMode = (mode) => {
    setDarkMode(mode)
    localStorage.setItem('mode', mode)
    effectBodyClass(mode)
  }

  return {
    darkMode,
    toggleDarkMode,
  }
}

export const DarkModeProvider = props => {
  const { darkMode, toggleDarkMode } = useDarkMode()
  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {props.children}
    </DarkModeContext.Provider>
  )
}