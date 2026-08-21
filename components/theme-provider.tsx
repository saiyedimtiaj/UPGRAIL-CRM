"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Force-pinned to light: no dark-mode toggle exists in the product, and this
// also guards against a stale `theme` value left in localStorage from
// earlier development. next-themes is kept so a real switch could be
// re-enabled later by changing this one prop.
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
