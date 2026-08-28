import type { NextConfig } from "next"

/**
 * The API is proxied under the app's own origin rather than called directly.
 *
 * Previously the browser talked to the API on a second origin while the auth
 * cookie was written by a Next server action on the *app* origin — so in any
 * deployment where the two are not both `localhost`, the cookie the API
 * needed was never attached and every request came back 401. Routing
 * `/api/*` through here makes the cookie first-party: the API sets it, the
 * browser returns it, and `sameSite: "lax"` is enough. No CORS preflight
 * either, which removes a round trip from every mutation.
 *
 * Set API_ORIGIN to the backend's base URL (no trailing slash).
 */
function resolveApiOrigin(): string {
  const origin = process.env.API_ORIGIN

  if (origin) return origin.replace(/\/+$/, "")

  // rewrites() is evaluated at BUILD time, so a missing API_ORIGIN would be
  // silently baked in as localhost and every request would fail in the
  // deployed app with no obvious cause. Fail the build instead.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "API_ORIGIN is not set. Add it to your deployment environment " +
        "(Vercel → Settings → Environment Variables) as the backend's base " +
        "URL, e.g. https://api.example.com — no trailing slash, no /api/v1."
    )
  }

  return "http://localhost:8000"
}

const API_ORIGIN = resolveApiOrigin()

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // The framework banner leaks the stack to anyone reading response headers.
  poweredByHeader: false,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ]
  },

  compiler: {
    // Keep error/warn so production incidents remain diagnosable.
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  experimental: {
    // These three are barrel-exported; without this every icon or chart
    // import pulls the whole package into the client bundle.
    optimizePackageImports: ["lucide-react", "motion", "recharts"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
}

export default nextConfig
