"use client"

/**
 * Last-resort boundary for failures in the root layout itself.
 *
 * This replaces the entire document when it renders, so it must supply its
 * own <html> and <body> and cannot rely on any provider, font variable, or
 * global stylesheet — hence the inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8faf9",
          color: "#0c1410",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 8px" }}>
            AdFund Global is temporarily unavailable
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#6b7d74",
              margin: "0 0 20px",
              lineHeight: 1.6,
            }}
          >
            The application failed to start. Your data has not been changed.
            Reload the page to try again.
          </p>
          {error.digest ? (
            <p
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                color: "#9aa8a1",
                margin: "0 0 20px",
              }}
            >
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              cursor: "pointer",
              border: "none",
              borderRadius: "10px",
              backgroundColor: "#0c1410",
              color: "#ffffff",
              padding: "10px 20px",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}
