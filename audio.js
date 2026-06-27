// audio.js — drop-in replacement for the horror browser game
// Supports real audio files (mp3/ogg/wav) defined in config/audio.js,
// with automatic fallback to the original Web Audio oscillator for any
// profile that has no file assigned.
//
// Public API is identical to the original:
//   AudioEngine.play(name)
//   AudioEngine.playScene(sceneId, fallbackSound)
//   AudioEngine.stop()
//   AudioEngine.fadeOut(duration)
//   AudioEngine.playEndingTone()
//   AudioEngine.toggleMute()
//   AudioEngine.applySettings(settings)
//   AudioEngine.isMuted()

window.AudioEngine = (() => {
  // ─── State ──────────────────────────────────────────────────────────────────
  let ctx;
  let muted = false;
  let volumes = { ...(window.AudioConfig?.defaults || {}) };

  // Active oscillator track (legacy synth path)
  let oscTrack = null;

  // Active file-based track: { el: HTMLAudioElement, gainNode, sourceNode }
  let fileTrack = null;

  // ─── Web Audio context ───────────────────────────────────────────────────────
  function ensureCtx() {
    if (!ctx) ctx = new AudioContext();
    // Resume if the browser suspended it (autoplay policy)
    if (ctx.state === "suspended") ctx.resume();
  }

  // ─── Helpers to resolve a profile ────────────────────────────────────────────
  function getProfile(name) {
    return (window.AudioConfig?.profiles || {})[name] || null;
  }

  function getFilePath(name) {
    // Looks for AudioConfig.files[name] — a string path or array of paths
    const files = window.AudioConfig?.files || {};
    const entry = files[name];
    if (!entry) return null;
    // Accept either a single string or an array (picks the first browser-playable one)
    if (Array.isArray(entry)) {
      const audio = new Audio();
      for (const path of entry) {
        // Guess type from extension to use canPlayType
        const ext = path.split(".").pop().toLowerCase();
        const typeMap = { mp3: "audio/mpeg", ogg: "audio/ogg", wav: "audio/wav", flac: "audio/flac", m4a: "audio/mp4" };
        const mime = typeMap[ext] || "";
        if (!mime || audio.canPlayType(mime) !== "") return path;
      }
      return entry[0]; // Fallback: try the first one anyway
    }
    return entry;
  }

  // ─── Stop everything ─────────────────────────────────────────────────────────
  function stopOsc() {
    if (!oscTrack) return;
    if (oscTrack.timer) clearInterval(oscTrack.timer);
    try { oscTrack.osc.stop(); } catch (_) {}
    oscTrack = null;
  }

  function stopFile() {
    if (!fileTrack) return;
    try {
      fileTrack.el.pause();
      fileTrack.el.src = "";
    } catch (_) {}
    fileTrack = null;
  }

  function stop() {
    stopOsc();
    stopFile();
  }

  // ─── Fade out (returns a Promise) ────────────────────────────────────────────
  function fadeOut(duration = 1400) {
    if (!oscTrack && !fileTrack) return Promise.resolve();

    ensureCtx();
    const ms = duration;

    // Fade the oscillator path
    if (oscTrack) {
      const playing = oscTrack;
      oscTrack = null;
      if (playing.timer) clearInterval(playing.timer);
      const now = ctx.currentTime;
      playing.gain.gain.cancelScheduledValues(now);
      playing.gain.gain.setValueAtTime(playing.gain.gain.value, now);
      playing.gain.gain.linearRampToValueAtTime(0.0001, now + ms / 1000);
      setTimeout(() => { try { playing.osc.stop(); } catch (_) {} }, ms);
    }

    // Fade the file path (volume ramp via setInterval — HTMLAudioElement has no
    // scheduler, but a short setInterval at ~60fps is smooth enough)
    if (fileTrack) {
      const playing = fileTrack;
      fileTrack = null;
      const startVol = playing.el.volume;
      const steps = 30;
      const stepMs = ms / steps;
      let step = 0;
      const iv = setInterval(() => {
        step++;
        playing.el.volume = Math.max(0, startVol * (1 - step / steps));
        if (step >= steps) {
          clearInterval(iv);
          try { playing.el.pause(); playing.el.src = ""; } catch (_) {}
        }
      }, stepMs);
    }

    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ─── Compute effective volume ─────────────────────────────────────────────────
  function effectiveVolume(isMusic) {
    const master = volumes.masterVolume ?? 1;
    const track  = isMusic ? (volumes.musicVolume ?? 0.75) : (volumes.sfxVolume ?? 0.85);
    return master * track;
  }

  // ─── Play via real audio file ─────────────────────────────────────────────────
  function playFile(path, isMusic = false, profileGain = 1) {
    stopOsc();
    stopFile();

    const el = new Audio(path);
    el.loop = true;
    el.volume = Math.min(1, effectiveVolume(isMusic) * (profileGain / 0.03));
    // profileGain is the oscillator gain (0.01–0.05); normalise it so that
    // 0.03 (the midpoint) maps to 1.0 and extremes scale naturally.

    el.play().catch(err => {
      // Autoplay was blocked — this rarely happens once the user has clicked
      // something, but we handle it gracefully.
      console.warn("[AudioEngine] File play blocked:", err.message);
    });

    fileTrack = { el };
  }

  // ─── Play via oscillator (original synth path) ───────────────────────────────
  function playOsc(name, profile) {
    stopOsc();
    stopFile();

    ensureCtx();

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = profile.type;
    osc.frequency.value = profile.freq;

    const baseGain = profile.gain * effectiveVolume(false);
    gain.gain.value = baseGain;

    osc.connect(gain).connect(ctx.destination);
    osc.start();

    let timer = null;
    if (profile.pulse) {
      timer = setInterval(() => {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(baseGain, now + 0.06);
        gain.gain.linearRampToValueAtTime(0.001,    now + 0.24);
      }, name === "heartbeat" ? 760 : 1200);
    }

    oscTrack = { osc, gain, timer };
  }

  // ─── Main play entry point ────────────────────────────────────────────────────
  function play(name) {
    if (muted || !name) return;

    const filePath = getFilePath(name);
    if (filePath) {
      const profile  = getProfile(name);
      const isMusic  = name === "ending";
      const gain     = profile?.gain ?? 0.03;
      playFile(filePath, isMusic, gain);
      return;
    }

    // No file assigned — fall back to oscillator
    const profile = getProfile(name) || getProfile("wind");
    if (!profile) return;
    playOsc(name, profile);
  }

  // ─── Ending tone ─────────────────────────────────────────────────────────────
  function playEndingTone() {
    if (muted) return;

    // If "ending" has a file, play it
    const filePath = getFilePath("ending");
    if (filePath) {
      const profile = getProfile("ending");
      playFile(filePath, true, profile?.gain ?? 0.008);
      return;
    }

    // Oscillator fallback (original behaviour)
    ensureCtx();
    stop();

    const profile = getProfile("ending") || { freq: 110, type: "sine", gain: 0.008 };
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = profile.type;
    osc.frequency.value = profile.freq;
    gain.gain.value = profile.gain * effectiveVolume(true);

    osc.connect(gain).connect(ctx.destination);
    osc.start();

    oscTrack = { osc, gain, timer: null };
  }

  // ─── Scene helper ─────────────────────────────────────────────────────────────
  function playScene(sceneId, fallbackSound) {
    const audio = window.AssetManager?.audioFor(sceneId, fallbackSound) || { ambience: fallbackSound };
    play(audio.music || audio.ambience);
  }

  // ─── Mute ────────────────────────────────────────────────────────────────────
  function toggleMute() {
    muted = !muted;
    if (muted) {
      stop();
    }
    return muted;
  }

  // ─── Volume settings ──────────────────────────────────────────────────────────
  function applySettings(settings = {}) {
    volumes = {
      ...volumes,
      masterVolume: settings.masterVolume ?? volumes.masterVolume ?? 1,
      musicVolume:  settings.musicVolume  ?? volumes.musicVolume  ?? 0.75,
      sfxVolume:    settings.sfxVolume    ?? volumes.sfxVolume    ?? 0.85,
    };
  }

  // ─── Public API ───────────────────────────────────────────────────────────────
  return {
    play,
    playScene,
    stop,
    fadeOut,
    playEndingTone,
    toggleMute,
    applySettings,
    isMuted: () => muted,
  };
})();

window.AudioManager = window.AudioEngine;
