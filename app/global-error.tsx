"use client"; // Error boundaries must be Client Components

/**
 * Last-resort screen when the root layout itself fails. It replaces the whole
 * document, so it carries its own minimal styles (globals.css is not loaded).
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="sq">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#060e1f",
          color: "#e6ecf7",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <title>KS Tirana</title>
        <div>
          <p style={{ letterSpacing: "0.2em", fontWeight: 700, color: "#dab766" }}>KS TIRANA</p>
          <h1 style={{ fontSize: 28, margin: "12px 0 8px" }}>Faqja nuk u ngarkua dot</h1>
          <p style={{ opacity: 0.7, margin: 0 }}>This page couldn&apos;t load. Please try again.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 24,
              padding: "12px 22px",
              border: 0,
              borderRadius: 10,
              background: "#1d5ae6",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Provo përsëri / Try again
          </button>
        </div>
      </body>
    </html>
  );
}
