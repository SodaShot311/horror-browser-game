// menu-music.js
// Add this AFTER ui.js (and AFTER audio.js) in index.html:
//   <script src="audio.js"></script>
//   <script src="ui.js"></script>
//   <script src="menu-music.js"></script>
//   <script src="game.js"></script>
//
// Menu music is driven entirely by UI's "title" / "game" screen events
// (UI.onScreen), not by wiring listeners onto individual buttons or the
// title screen container. This removes the bubbling-click race that let
// "New Game" / "Continue" start the music, and means any future way of
// leaving the title screen automatically stops it for free.

window.MenuMusic = (() => {
  // ── Config ──────────────────────────────────────────────────────────────────
  const MUSIC_SRC = "assets/audio/music/menu.mp3";
  const VOLUME    = 0.6;
  const FADE_MS   = 1200;
  // ────────────────────────────────────────────────────────────────────────────

  let el          = null;
  let playing     = false;
  let fadeIv      = null;
  let unlocked    = false;   // has a user gesture satisfied autoplay policy?
  let onTitle     = false;   // are we currently on the title screen?
  let unlockCleanup = null;  // removes the unlock listeners once used

  function getEl() {
    if (!el) {
      el = new Audio(MUSIC_SRC);
      el.loop = true;
      el.volume = 0;
    }
    return el;
  }

  // ── Volume ramp ─────────────────────────────────────────────────────────────
  function fadeVolume(from, to, durationMs, onDone) {
    if (fadeIv) clearInterval(fadeIv);
    const audioEl = getEl();
    const steps  = 30;
    const stepMs = durationMs / steps;
    let   step   = 0;
    audioEl.volume = Math.min(1, Math.max(0, from));

    fadeIv = setInterval(() => {
      step++;
      audioEl.volume = Math.min(1, Math.max(0, from + (to - from) * (step / steps)));
      if (step >= steps) {
        clearInterval(fadeIv);
        fadeIv = null;
        audioEl.volume = Math.min(1, Math.max(0, to));
        if (onDone) onDone();
      }
    }, stepMs);
  }

  // ── Play menu music ──────────────────────────────────────────────────────────
  function play() {
    // Re-check current conditions every time, rather than trusting whoever
    // called us — this is what prevents stale/late calls from starting music
    // once the player has left the title screen.
    if (playing || !onTitle || !unlocked || AudioEngine.isMuted()) return;

    const audioEl = getEl();
    audioEl.play().catch(err => {
      console.warn("[MenuMusic] Playback blocked:", err.message);
    });

    fadeVolume(0, VOLUME, 800);
    playing = true;
  }

  // ── Stop menu music ──────────────────────────────────────────────────────────
  function stop() {
    if (!playing) return;
    playing = false;

    fadeVolume(el.volume, 0, FADE_MS, () => {
      el.pause();
      el.currentTime = 0;
    });
  }

  // ── Unlock on first valid user interaction ────────────────────────────────────
  // Uses the capture phase on `document` (not `titleScreen`) so it always fires
  // exactly once, on the very first interaction anywhere on the page, and never
  // depends on bubbling order relative to button handlers.
  function setupUnlock() {
    if (unlocked) return;

    const handler = () => {
      if (unlocked) return;
      unlocked = true;
      if (unlockCleanup) unlockCleanup();
      play(); // no-op unless we're still on the title screen
    };

    const events = ["pointerdown", "keydown"];
    events.forEach(evt => document.addEventListener(evt, handler, { capture: true, once: true }));
    unlockCleanup = () => {
      events.forEach(evt => document.removeEventListener(evt, handler, { capture: true }));
      unlockCleanup = null;
    };
  }

  // ── Wire up after the page loads ─────────────────────────────────────────────
  window.addEventListener("load", () => {
    setupUnlock();

    // Single source of truth: UI's own screen-change events.
    UI.onScreen("title", () => {
      onTitle = true;
      play(); // no-op until a user gesture has unlocked audio
    });
    UI.onScreen("game", () => {
      onTitle = false;
      stop();
    });

    // Mute button — pause/resume menu music alongside the game audio.
    const muteButton = document.getElementById("muteButton");
    if (muteButton) {
      muteButton.addEventListener("click", () => {
        if (AudioEngine.isMuted()) {
          if (el) el.pause();
        } else if (onTitle) {
          play();
        }
      });
    }
  });

  return { play, stop };
})();
