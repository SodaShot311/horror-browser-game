window.AudioEngine = (() => {
  let ctx;
  let muted = false;
  let current = null;

  const profiles = {
    rain: { freq: 160, type: "sawtooth", gain: 0.025 },
    wind: { freq: 90, type: "sine", gain: 0.03 },
    dragging: { freq: 45, type: "square", gain: 0.025, pulse: true },
    buzz: { freq: 58, type: "sawtooth", gain: 0.02 },
    heartbeat: { freq: 70, type: "sine", gain: 0.045, pulse: true },
    footsteps: { freq: 120, type: "triangle", gain: 0.025, pulse: true }
  };

  function ensure() {
    if (!ctx) ctx = new AudioContext();
  }

  function stop() {
    if (!current) return;
    current.osc.stop();
    clearInterval(current.timer);
    current = null;
  }

  function play(name) {
    if (muted || !name) return;
    ensure();
    stop();
    const profile = profiles[name] || profiles.wind;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = profile.type;
    osc.frequency.value = profile.freq;
    gain.gain.value = profile.gain;
    osc.connect(gain).connect(ctx.destination);
    osc.start();

    let timer = null;
    if (profile.pulse) {
      timer = setInterval(() => {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(profile.gain, now + 0.06);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.24);
      }, name === "heartbeat" ? 760 : 1200);
    }
    current = { osc, timer };
  }

  function toggleMute() {
    muted = !muted;
    if (muted) stop();
    return muted;
  }

  return { play, stop, toggleMute, isMuted: () => muted };
})();
