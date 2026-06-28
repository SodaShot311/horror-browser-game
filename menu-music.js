// menu-music.js
// Add this AFTER audio.js in index.html:
//   <script src="audio.js"></script>
//   <script src="menu-music.js"></script>
//   <script src="ui.js"></script>
//   <script src="game.js"></script>

window.MenuMusic = (() => {
  // ── Config ──────────────────────────────────────────────────────────────────
  const MUSIC_SRC = "assets/audio/music/menu.mp3";
  const VOLUME    = 0.6;
  const FADE_MS   = 1200;
  // ────────────────────────────────────────────────────────────────────────────

  let el      = null;
  let playing = false;
  let fadeIv  = null;

  // ── Volume ramp ─────────────────────────────────────────────────────────────
  function fadeVolume(from, to, durationMs, onDone) {
    if (fadeIv) clearInterval(fadeIv);
    if (!el) return;
    const steps  = 30;
    const stepMs = durationMs / steps;
    let   step   = 0;
    el.volume    = Math.min(1, Math.max(0, from));

    fadeIv = setInterval(() => {
      step++;
      el.volume = Math.min(1, Math.max(0, from + (to - from) * (step / steps)));
      if (step >= steps) {
        clearInterval(fadeIv);
        fadeIv    = null;
        el.volume = Math.min(1, Math.max(0, to));
        if (onDone) onDone();
      }
    }, stepMs);
  }

  // ── Play menu music ──────────────────────────────────────────────────────────
  function play() {
    if (playing || AudioEngine.isMuted()) return;

    if (!el) {
      el       = new Audio(MUSIC_SRC);
      el.loop  = true;
      el.volume = 0;
    }

    el.play().catch(err => {
      console.warn("[MenuMusic] Playback blocked:", err.message);
    });

    fadeVolume(0, VOLUME, 800);
    playing = true;
  }

  // ── Stop menu music ──────────────────────────────────────────────────────────
  function stop() {
    if (!el || !playing) return;
    playing = false;

    fadeVolume(el.volume, 0, FADE_MS, () => {
      el.pause();
      el.currentTime = 0;
    });
  }

  // ── Wire up after the page loads ─────────────────────────────────────────────
  window.addEventListener("load", () => {

    // FIX: Hook directly onto the buttons instead of wrapping UI.showGame.
    // UI.render() calls showGame() as a local reference — wrapping window.UI.showGame
    // has no effect because it's never called through the public object.
    const newGameButton = document.getElementById("newGameButton");
    const continueButton = document.getElementById("continueButton");

    if (newGameButton) newGameButton.addEventListener("click", stop);
    if (continueButton) continueButton.addEventListener("click", stop);

    // Also stop when a save slot is loaded (clicking "Load" inside the save dialog)
    // The save dialog is rendered dynamically so we use event delegation.
    const saveDialog = document.getElementById("saveDialog");
    if (saveDialog) {
      saveDialog.addEventListener("click", e => {
        if (e.target.tagName === "BUTTON" && e.target.textContent.trim() === "Load") {
          stop();
        }
      });
    }

    // Still wrap showTitle so music resumes when the player returns to the menu
    const originalShowTitle = UI.showTitle.bind(UI);
    UI.showTitle = function (...args) {
      originalShowTitle(...args);
      play();
    };

    // Mute button — pause/resume menu music alongside the game audio
    const muteButton = document.getElementById("muteButton");
    if (muteButton) {
      muteButton.addEventListener("click", () => {
        if (AudioEngine.isMuted()) {
          if (el) el.pause();
        } else {
          const titleScreen = document.getElementById("titleScreen");
          const onTitle = titleScreen && !titleScreen.classList.contains("hidden");
          if (onTitle) play();
        }
      });
    }

    // Start music on first click (browser autoplay policy requires a gesture)
    const titleScreen = document.getElementById("titleScreen");
    if (titleScreen) {
      titleScreen.addEventListener("click", () => play(), { once: true });
    }
  });

  return { play, stop };
})();
