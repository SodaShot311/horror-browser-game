// audio.js
window.AudioEngine = (() => {

  // ─── State ───────────────────────────────────────────────────────────────────
  let ctx;
  let muted        = false;
  let current      = null;   // active oscillator track
  let fileTracks   = [];     // active file-based tracks
  let currentScene = null;   // scene id that is currently playing
  let volumes      = { ...(window.AudioConfig?.defaults || {}) };

  // ─── Web Audio context ───────────────────────────────────────────────────────
  function ensureCtx() {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
  }

  // ─── Profile / file helpers ──────────────────────────────────────────────────
  function getProfile(name) {
    return (window.AudioConfig?.profiles || {})[name] || null;
  }

  function getFileConfig(name) {
    const files = window.AudioConfig?.files || {};
    const entry = files[name];
    if (!entry) return null;
    if (entry.layers) return entry;
    if (Array.isArray(entry)) {
      const a = new Audio();
      for (const path of entry) {
        const ext  = path.split(".").pop().toLowerCase();
        const mime = { mp3: "audio/mpeg", ogg: "audio/ogg", wav: "audio/wav", flac: "audio/flac", m4a: "audio/mp4" }[ext] || "";
        if (!mime || a.canPlayType(mime) !== "") return { layers: [{ src: path, volume: 1 }] };
      }
      return { layers: [{ src: entry[0], volume: 1 }] };
    }
    return { layers: [{ src: entry, volume: 1 }] };
  }

  function effectiveVolume(isMusic) {
    const master = volumes.masterVolume ?? 1;
    const track  = isMusic ? (volumes.musicVolume ?? 0.75) : (volumes.sfxVolume ?? 0.85);
    return master * track;
  }

  // ─── Stop ────────────────────────────────────────────────────────────────────
  function stopOsc() {
    if (!current) return;
    if (current.timer) clearInterval(current.timer);
    try { current.osc.stop(); } catch (_) {}
    current = null;
  }

  function stopFiles() {
    fileTracks.forEach(t => { try { t.el.pause(); t.el.src = ""; } catch (_) {} });
    fileTracks = [];
  }

  function stop() {
    stopOsc();
    stopFiles();
    currentScene = null;
  }

  // ─── Fade out ────────────────────────────────────────────────────────────────
  function fadeOut(duration = 1400) {
    if (!current && !fileTracks.length) return Promise.resolve();
    ensureCtx();

    if (current) {
      const playing = current;
      current = null;
      if (playing.timer) clearInterval(playing.timer);
      const now = ctx.currentTime;
      playing.gain.gain.cancelScheduledValues(now);
      playing.gain.gain.setValueAtTime(playing.gain.gain.value, now);
      playing.gain.gain.linearRampToValueAtTime(0.0001, now + duration / 1000);
      setTimeout(() => { try { playing.osc.stop(); } catch (_) {} }, duration);
    }

    if (fileTracks.length) {
      const playing = fileTracks;
      fileTracks = [];
      const steps = 30, stepMs = duration / steps;
      let step = 0;
      const iv = setInterval(() => {
        step++;
        const ratio = Math.max(0, 1 - step / steps);
        playing.forEach(t => { t.el.volume = t.baseVolume * ratio; });
        if (step >= steps) {
          clearInterval(iv);
          playing.forEach(t => { try { t.el.pause(); t.el.src = ""; } catch (_) {} });
        }
      }, stepMs);
    }

    currentScene = null;
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  // ─── Spawn helpers ───────────────────────────────────────────────────────────
  function spawnFileLayer(src, layerVolume, isMusic) {
    const el  = new Audio(src);
    el.loop   = true;
    const vol = Math.min(1, effectiveVolume(isMusic) * (layerVolume ?? 1));
    el.volume = vol;
    el.play().catch(err => console.warn("[AudioEngine] File play blocked:", err.message));
    fileTracks.push({ el, baseVolume: vol });
  }

  function spawnOsc(name, profile) {
    ensureCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type   = profile.type;
    osc.frequency.value = profile.freq;
    const baseGain  = profile.gain * effectiveVolume(false);
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
    current = { osc, gain, timer };
  }

  // ─── Play one named sound (internal — does NOT stop existing tracks) ─────────
  function playOne(name, isMusic) {
    const fileConfig = getFileConfig(name);
    if (fileConfig) {
      fileConfig.layers.forEach(l => spawnFileLayer(l.src, l.volume, isMusic));
      return;
    }
    const profile = getProfile(name);
    if (profile) spawnOsc(name, profile);
  }

  // ─── Public: play a single sound ─────────────────────────────────────────────
  function play(name) {
    if (muted || !name) return;
    stop();
    playOne(name, name === "ending");
  }

  // ─── Public: play multiple sounds simultaneously ──────────────────────────────
  function playMany(names) {
    if (muted || !names?.length) return;
    stop();
    names.forEach(name => playOne(name, name === "ending"));
  }

  // ─── Scene helper ────────────────────────────────────────────────────────────
  function playScene(sceneId, fallbackSound) {
    if (muted) return;
    const audio = window.AssetManager?.audioFor(sceneId, fallbackSound)
                  || { ambience: fallbackSound || "wind", music: null };

    stop();
    currentScene = sceneId;

    if (audio.music) {
      playOne(audio.music, true);
    } else {
      const names = Array.isArray(audio.ambience) ? audio.ambience : [audio.ambience];
      names.forEach(name => playOne(name, false));
    }
  }

  // ─── Ending tone ─────────────────────────────────────────────────────────────
  // FIX 1: If a real file is already playing (started by playScene for the ending
  // scenes), skip the oscillator so it doesn't cut the music off.
  function playEndingTone() {
    if (muted) return;

    // If file tracks are already running (real ending music from playScene), keep them.
    if (fileTracks.length > 0) return;

    // Otherwise fall back to the oscillator tone (original behaviour).
    ensureCtx();
    stopOsc();

    const fileConfig = getFileConfig("ending");
    if (fileConfig) {
      fileConfig.layers.forEach(l => spawnFileLayer(l.src, l.volume, true));
      return;
    }

    const profile   = getProfile("ending") || { freq: 110, type: "sine", gain: 0.008 };
    const osc       = ctx.createOscillator();
    const gain      = ctx.createGain();
    osc.type        = profile.type;
    osc.frequency.value = profile.freq;
    gain.gain.value = profile.gain * effectiveVolume(true);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    current = { osc, gain, timer: null };
  }

  // ─── Mute / unmute ───────────────────────────────────────────────────────────
  // FIX 2: When unmuting, replay the scene that was active before mute.
  function toggleMute() {
    muted = !muted;

    if (muted) {
      // Remember which scene was playing so we can restore it
      const scene = currentScene;
      stop();
      currentScene = scene; // restore after stop() clears it
    } else {
      // Unmuting — restart the last scene if we know it
      if (currentScene) {
        playScene(currentScene);
      }
    }

    return muted;
  }

  // ─── Volume settings ─────────────────────────────────────────────────────────
  function applySettings(settings = {}) {
    volumes = {
      ...volumes,
      masterVolume: settings.masterVolume ?? volumes.masterVolume ?? 1,
      musicVolume:  settings.musicVolume  ?? volumes.musicVolume  ?? 0.75,
      sfxVolume:    settings.sfxVolume    ?? volumes.sfxVolume    ?? 0.85,
    };
  }

  return { play, playMany, playScene, stop, fadeOut, playEndingTone, toggleMute, applySettings, isMuted: () => muted };
})();

window.AudioManager = window.AudioEngine;
