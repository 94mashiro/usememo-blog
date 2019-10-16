import React, { useState, createContext, useEffect, useMemo } from 'react'



export const DarkModeContext = createContext({})

export const useDarkMode = ({
  lightClassName,
  darkClassName
} = {}) => {
  const currentMode = useMemo(() => {
    try {
      return window.localStorage.getItem('mode') || 'light'
    } catch (err) {
      return 'light'
    }
  }, [])
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
    if (typeof window !== 'undefined') {
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