import React, { useMemo } from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import { DarkModeProvider, useDarkMode } from "../utils/useDarkMode"
import DarkModeToggle from "./darkModeToggle"

export const Layout = props => {
  const { location, title, children } = props

  const rootPath = `${__PATH_PREFIX__}/`

  const { darkMode } = useDarkMode()

  // useEffect(() => {
  //   let header
  //   if (location.pathname === rootPath) {
  //     header = (
  //       <h1
  //         style={{
  //           ...scale(1.5),
  //           marginBottom: rhythm(1.5),
  //           marginTop: 0,
  //         }}
  //       >
  //         <Link
  //           style={{
  //             boxShadow: `none`,
  //             textDecoration: `none`,
  //             color: `inherit`,
  //           }}
  //           to={`/`}
  //         >
  //           {title}
  //         </Link>
  //       </h1>
  //     )
  //   } else {
  //     header = (
  //       <h3
  //         style={{
  //           fontFamily: `Montserrat, sans-serif`,
  //           marginTop: 0,
  //         }}
  //       >
  //         <Link
  //           style={{
  //             boxShadow: `none`,
  //             textDecoration: `none`,
  //             color: `inherit`,
  //           }}
  //           to={`/`}
  //         >
  //           {title}
  //         </Link>
  //       </h3>
  //     )
  //   }
  //   setHeader(header)
  // }, [location, title])

  const Header = useMemo(() => {
    if (location.pathname === rootPath) {
      return (
        <h1
          style={{
            ...scale(0.75),
            marginBottom: 0,
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
              color: `var(--textTitle)`,
            }}
            to={`/`}
          >
            {title}
          </Link>
       </h1>
      )
    } else {
      return (
        <h3
          style={{
            fontFamily: 'Montserrat, sans-serif',
            marginTop: 0,
            marginBottom: 0,
            height: 42, // because
            lineHeight: '2.625rem',
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
              color: `var(--header)`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h3>
      )
    }
  }, [location, title])

  return (
    <div
      style={{
        color: 'var(--textNormal)',
        background: 'var(--bg)',
        transition: 'color 0.2s ease-out, background 0.2s ease-out',
        minHeight: '100vh',
      }}
    >
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
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.625rem',
          }}
        >
          {Header}
          <DarkModeToggle />
        </header>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    </div>
  )
}

export default Layout
