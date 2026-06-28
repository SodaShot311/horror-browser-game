// audio.js — supports shared sounds, array ambience, and mixed file layers
//
// PUBLIC API (fully backwards compatible):
//   AudioEngine.play(name)           — play a single named sound
//   AudioEngine.playMany(names)      — play multiple named sounds simultaneously
//   AudioEngine.playScene(sceneId, fallbackSound)
//   AudioEngine.stop()
//   AudioEngine.fadeOut(duration)
//   AudioEngine.playEndingTone()
//   AudioEngine.toggleMute()
//   AudioEngine.applySettings(settings)
//   AudioEngine.isMuted()

window.AudioEngine = (() => {

  // ─── State ───────────────────────────────────────────────────────────────────
  let ctx;
  let muted   = false;
  let volumes = { ...(window.AudioConfig?.defaults || {}) };

  // Active oscillator tracks (array so multiple can run together)
  let oscTracks  = [];
  // Active file tracks (array for layering)
  let fileTracks = [];

  // ─── Web Audio context ───────────────────────────────────────────────────────
  function ensureCtx() {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
  }

  // ─── Profile / file resolution ───────────────────────────────────────────────
  function getProfile(name) {
    return (window.AudioConfig?.profiles || {})[name] || null;
  }

  // Returns { layers: [{src, volume}] } or null
  function getFileConfig(name) {
    const files = window.AudioConfig?.files || {};
    const entry = files[name];
    if (!entry) return null;
    if (entry.layers) return entry;
    if (Array.isArray(entry)) {
      const audio = new Audio();
      for (const path of entry) {
        const ext  = path.split(".").pop().toLowerCase();
        const mime = { mp3: "audio/mpeg", ogg: "audio/ogg", wav: "audio/wav", flac: "audio/flac", m4a: "audio/mp4" }[ext] || "";
        if (!mime || audio.canPlayType(mime) !== "") return { layers: [{ src: path, volume: 1 }] };
      }
      return { layers: [{ src: entry[0], volume: 1 }] };
    }
    return { layers: [{ src: entry, volume: 1 }] };
  }

  // ─── Effective volume ────────────────────────────────────────────────────────
  function effectiveVolume(isMusic) {
    const master = volumes.masterVolume ?? 1;
    const track  = isMusic ? (volumes.musicVolume ?? 0.75) : (volumes.sfxVolume ?? 0.85);
    return master * track;
  }

  // ─── Stop all ────────────────────────────────────────────────────────────────
  function stopOscs() {
    oscTracks.forEach(t => {
      if (t.timer) clearInterval(t.timer);
      try { t.osc.stop(); } catch (_) {}
    });
    oscTracks = [];
  }

  function stopFiles() {
    fileTracks.forEach(t => {
      try { t.el.pause(); t.el.src = ""; } catch (_) {}
    });
    fileTracks = [];
  }

  function stop() {
    stopOscs();
    stopFiles();
  }

  // ─── Fade out ────────────────────────────────────────────────────────────────
  function fadeOut(duration = 1400) {
    if (!oscTracks.length && !fileTracks.length) return Promise.resolve();
    ensureCtx();

    // Fade oscillators
    oscTracks.forEach(t => {
      if (t.timer) clearInterval(t.timer);
      const now = ctx.currentTime;
      t.gain.gain.cancelScheduledValues(now);
      t.gain.gain.setValueAtTime(t.gain.gain.value, now);
      t.gain.gain.linearRampToValueAtTime(0.0001, now + duration / 1000);
      setTimeout(() => { try { t.osc.stop(); } catch (_) {} }, duration);
    });
    oscTracks = [];

    // Fade file layers
    if (fileTracks.length) {
      const playing = fileTracks;
      fileTracks = [];
      const steps  = 30;
      const stepMs = duration / steps;
      let   step   = 0;
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

    return new Promise(resolve => setTimeout(resolve, duration));
  }

  // ─── Play a single file layer ────────────────────────────────────────────────
  function spawnFileLayer(src, layerVolume, isMusic) {
    const el  = new Audio(src);
    el.loop   = true;
    const vol = Math.min(1, effectiveVolume(isMusic) * (layerVolume ?? 1));
    el.volume = vol;
    el.play().catch(err => console.warn("[AudioEngine] File play blocked:", err.message));
    fileTracks.push({ el, baseVolume: vol });
  }

  // ─── Play a single oscillator ────────────────────────────────────────────────
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

    oscTracks.push({ osc, gain, timer });
  }

  // ─── Play one named sound (adds to current layers, does NOT stop others) ─────
  function playOne(name, isMusic = false) {
    const fileConfig = getFileConfig(name);
    if (fileConfig) {
      fileConfig.layers.forEach(layer => spawnFileLayer(layer.src, layer.volume, isMusic));
      return;
    }
    const profile = getProfile(name);
    if (profile) spawnOsc(name, profile);
  }

  // ─── Public: play a single sound (replaces whatever is playing) ──────────────
  function play(name) {
    if (muted || !name) return;
    stop();
    playOne(name, name === "ending");
  }

  // ─── Public: play multiple sounds simultaneously (replaces whatever is playing)
  function playMany(names) {
    if (muted || !names?.length) return;
    stop();
    names.forEach(name => playOne(name, name === "ending"));
  }

  // ─── Scene helper ────────────────────────────────────────────────────────────
  // audioFor() now always returns { ambience: [...], music, sfx }
  function playScene(sceneId, fallbackSound) {
    if (muted) return;
    const audio = window.AssetManager?.audioFor(sceneId, fallbackSound)
                  || { ambience: [fallbackSound || "wind"], music: null };

    stop();

    // Music takes priority over ambience when both are set
    if (audio.music) {
      playOne(audio.music, true);
    } else {
      const names = Array.isArray(audio.ambience) ? audio.ambience : [audio.ambience];
      names.forEach(name => playOne(name, false));
    }
  }

  // ─── Ending tone ─────────────────────────────────────────────────────────────
  function playEndingTone() {
    if (muted) return;
    stop();

    const fileConfig = getFileConfig("ending");
    if (fileConfig) {
      fileConfig.layers.forEach(layer => spawnFileLayer(layer.src, layer.volume, true));
      return;
    }

    ensureCtx();
    const profile   = getProfile("ending") || { freq: 110, type: "sine", gain: 0.008 };
    const osc       = ctx.createOscillator();
    const gain      = ctx.createGain();
    osc.type        = profile.type;
    osc.frequency.value = profile.freq;
    gain.gain.value = profile.gain * effectiveVolume(true);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    oscTracks.push({ osc, gain, timer: null });
  }

  // ─── Mute ────────────────────────────────────────────────────────────────────
  function toggleMute() {
    muted = !muted;
    if (muted) stop();
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
