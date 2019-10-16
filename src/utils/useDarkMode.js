import React, { useState, useEffect, useMemo, useCallback } from 'react'

export const useDarkMode = ({
  lightClassName,
  darkClassName
} = {}) => {
  const defaultMode = useMemo(() => {
    try {
      return window.localStorage.getItem('mode') || 'light'
    } catch (err) {
      return 'light'
    }
  }, [])
  const [darkMode, setDarkMode] = useState(defaultMode)

  const effectBodyClass = useCallback(
    mode => {
      const classList = document.querySelector('body').classList
      if (mode === 'light') {
        classList.add(lightClassName)
        classList.remove(darkClassName)
      } else {
        classList.add(darkClassName)
        classList.remove(lightClassName)
      }
    },
    [lightClassName, darkClassName],
  )

  useEffect(() => {
    effectBodyClass(defaultMode)
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