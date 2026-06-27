window.AudioEngine = (() => {
  let ctx;
  let muted = false;
  let current = null;
  let volumes = { ...(window.AudioConfig?.defaults || {}) };

  function ensure() {
    if (!ctx) {
      ctx = new AudioContext();
    }
  }

  function stop() {
    if (!current) return;

    try {
      current.osc.stop();
    } catch (error) {
      // Oscillator may already be stopped.
    }

    if (current.timer) {
      clearInterval(current.timer);
    }

    current = null;
  }

  function fadeOut(duration = 1400) {
    if (!current) {
      return Promise.resolve();
    }

    ensure();

    const playing = current;
    current = null;

    if (playing.timer) {
      clearInterval(playing.timer);
    }

    const now = ctx.currentTime;

    playing.gain.gain.cancelScheduledValues(now);
    playing.gain.gain.setValueAtTime(
      playing.gain.gain.value,
      now
    );

    playing.gain.gain.linearRampToValueAtTime(
      0.0001,
      now + duration / 1000
    );

    return new Promise(resolve => {
      window.setTimeout(() => {
        try {
          playing.osc.stop();
        } catch (error) {
          // Oscillator may already be stopped.
        }

        resolve();
      }, duration);
    });
  }

  function playEndingTone() {
    if (muted) return;

    ensure();
    stop();

    const profile =
      window.AudioConfig?.profiles?.ending || {
        freq: 110,
        type: "sine",
        gain: 0.008
      };

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = profile.type;
    osc.frequency.value = profile.freq;

    gain.gain.value =
      profile.gain *
      (volumes.masterVolume || 1) *
      (volumes.musicVolume || 1);

    osc.connect(gain).connect(ctx.destination);
    osc.start();

    current = {
      osc,
      gain,
      timer: null
    };
  }

  function play(name) {
    if (muted || !name) return;

    ensure();
    stop();

    const profiles = window.AudioConfig?.profiles || {};
    const profile = profiles[name] || profiles.wind;

    if (!profile) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = profile.type;
    osc.frequency.value = profile.freq;

    const baseGain =
      profile.gain *
      (volumes.masterVolume || 1) *
      (volumes.sfxVolume || 1);

    gain.gain.value = baseGain;

    osc.connect(gain).connect(ctx.destination);
    osc.start();

    let timer = null;

    if (profile.pulse) {
      timer = setInterval(() => {
        const now = ctx.currentTime;

        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(
          baseGain,
          now + 0.06
        );
        gain.gain.linearRampToValueAtTime(
          0.001,
          now + 0.24
        );
      }, name === "heartbeat" ? 760 : 1200);
    }

    current = {
      osc,
      gain,
      timer
    };
  }

  function toggleMute() {
    muted = !muted;

    if (muted) {
      stop();
    }

    return muted;
  }

  function playScene(sceneId, fallbackSound) {
    const audio =
      window.AssetManager?.audioFor(
        sceneId,
        fallbackSound
      ) || {
        ambience: fallbackSound
      };

    play(audio.music || audio.ambience);
  }

  function applySettings(settings = {}) {
    volumes = {
      ...volumes,
      masterVolume:
        settings.masterVolume ??
        volumes.masterVolume ??
        1,

      musicVolume:
        settings.musicVolume ??
        volumes.musicVolume ??
        0.75,

      sfxVolume:
        settings.sfxVolume ??
        volumes.sfxVolume ??
        0.85
    };
  }

  return {
    play,
    playScene,
    stop,
    fadeOut,
    playEndingTone,
    toggleMute,
    applySettings,
    isMuted: () => muted
  };
})();

<<<<<<< HEAD
window.AudioManager = window.AudioEngine;
=======
window.AudioManager = window.AudioEngine;
>>>>>>> 19508081835e1d64fc7d6ff9cb0a84f938381d52
