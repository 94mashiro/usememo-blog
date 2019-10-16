import React, { useState, createContext, useEffect, useMemo } from 'react'



export const DarkModeContext = createContext({})

export const useDarkMode = ({
  lightClassName,
  darkClassName
} = {}) => {
  const isSSRMode = useMemo(() => {
    return window == null
  }, [window])
  const currentMode = useMemo(() => {
    if (isSSRMode) {
      return 'light'
    } else {
      return window.localStorage.getItem('mode') || 'light'
    }
  }, [isSSRMode])
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
    if (!isSSRMode) {
      window.localStorage.setItem('mode', mode)
    }
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