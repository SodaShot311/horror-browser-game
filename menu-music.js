// menu-music.js
// Plays background music on the main menu and stops it when the game starts.
// Add this AFTER audio.js in index.html:
//   <script src="audio.js"></script>
//   <script src="menu-music.js"></script>  ← add this line

window.MenuMusic = (() => {
  // ── Config ──────────────────────────────────────────────────────────────────
  // Change this path to your menu music file.
  const MUSIC_SRC = "assets/audio/music/menu.mp3";

  // How loud the menu music is (0.0 – 1.0).
  const VOLUME = 0.6;

  // How long the fade-out takes when the game starts, in milliseconds.
  const FADE_MS = 1200;
  // ────────────────────────────────────────────────────────────────────────────

  let el = null;
  let playing = false;

  function play() {
    if (playing || AudioEngine.isMuted()) return;

    if (!el) {
      el = new Audio(MUSIC_SRC);
      el.loop = true;
      el.volume = 0;
    }

    el.play().catch(err => {
      // Browser blocked autoplay — will retry on next user interaction.
      console.warn("[MenuMusic] Playback blocked:", err.message);
    });

    // Fade in over 800ms so it doesn't slam in
    fadeVolume(el, 0, VOLUME, 800);
    playing = true;
  }

  function stop() {
    if (!el || !playing) return;
    playing = false;

    const target = el;
    fadeVolume(target, target.volume, 0, FADE_MS, () => {
      target.pause();
      target.currentTime = 0;
    });
  }

  // Simple volume ramp using setInterval
  function fadeVolume(audio, from, to, durationMs, onDone) {
    const steps  = 30;
    const stepMs = durationMs / steps;
    let   step   = 0;
    audio.volume = from;

    const iv = setInterval(() => {
      step++;
      audio.volume = Math.min(1, Math.max(0, from + (to - from) * (step / steps)));
      if (step >= steps) {
        clearInterval(iv);
        audio.volume = to;
        if (onDone) onDone();
      }
    }, stepMs);
  }

  // ── Hook into UI.showTitle and UI.showGame ──────────────────────────────────
  // We wait for the page to finish loading so UI is already defined,
  // then wrap the two functions that control screen visibility.

  window.addEventListener("load", () => {
    if (!window.UI) {
      console.warn("[MenuMusic] UI not found — make sure menu-music.js loads after ui.js");
      return;
    }

    // Wrap showTitle: play menu music whenever the title screen appears
    const originalShowTitle = UI.showTitle.bind(UI);
    UI.showTitle = function (...args) {
      originalShowTitle(...args);
      play();
    };

    // Wrap showGame: stop menu music whenever the game screen appears
    const originalShowGame = UI.showGame.bind(UI);
    UI.showGame = function (...args) {
      originalShowGame(...args);
      stop();
    };

    // The title screen is already visible on first load — start music now.
    // We need a user gesture first on most browsers, so we listen for the
    // first click anywhere on the title screen.
    const titleScreen = document.getElementById("titleScreen");
    if (titleScreen) {
      titleScreen.addEventListener("click", () => play(), { once: true });
    }
  });

  // Also respect the mute button — stop/resume menu music accordingly
  window.addEventListener("load", () => {
    const muteButton = document.getElementById("muteButton");
    if (!muteButton) return;

    muteButton.addEventListener("click", () => {
      // AudioEngine.toggleMute() has already run by now (it's registered first)
      if (AudioEngine.isMuted()) {
        if (el) { el.pause(); }
      } else {
        const titleScreen = document.getElementById("titleScreen");
        const onTitle = titleScreen && !titleScreen.classList.contains("hidden");
        if (onTitle) play();
      }
    });
  });

  return { play, stop };
})();
