import type { NextConfig } from "next"

function resolveApiOrigin(): string {
  const origin = process.env.API_ORIGIN

  if (origin) return origin.replace(/\/+$/, "")

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
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  experimental: {
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
