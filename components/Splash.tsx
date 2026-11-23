import Image from "next/image";

/**
 * Intro screen on the first visit of a session: crest, drawn ring, wordmark,
 * then the panel lifts away. Pure CSS (see .splash in globals.css): it is shown
 * only when the head script sets <html data-splash="show">, and its animation
 * always ends hidden, so it can never block the page.
 */
export function Splash() {
  return (
    <div className="splash" aria-hidden="true">
      <div className="splash-mark">
        <svg className="splash-ring" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="92" />
        </svg>
        <Image src="/images/ks-tirana-crest.png" alt="" width={90} height={111} priority className="splash-crest" />
      </div>
      <p className="splash-word font-display">KS TIRANA</p>
      <p className="splash-year">Bardhe e blu · 1920</p>
      <div className="splash-bar">
        <span />
      </div>
    </div>
  );
}
