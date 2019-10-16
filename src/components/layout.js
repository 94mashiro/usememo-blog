import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import { DarkModeProvider, useDarkMode } from "../utils/useDarkMode"
import DarkModeToggle from "./darkModeToggle"

export const Layout = props => {
  const { location, title, children } = props

  const rootPath = `${__PATH_PREFIX__}`

  const [header, setHeader] = useState()

  const { darkMode } = useDarkMode()

  useEffect(() => {
    let header
    if (location.pathname === rootPath) {
      header = (
        <h1
          style={{
            ...scale(1.5),
            marginBottom: rhythm(1.5),
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h1>
      )
    } else {
      header = (
        <h3
          style={{
            fontFamily: `Montserrat, sans-serif`,
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h3>
      )
    }
    setHeader(header)
  }, [location, title])

  return (
    <DarkModeProvider>
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
        className={darkMode}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          {header}
          <DarkModeToggle />
        </header>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    </DarkModeProvider>
  )
}

export default Layout
