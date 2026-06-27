window.AudioConfig = {
  profiles: {
    rain: { freq: 160, type: "sawtooth", gain: 0.025 },
    wind: { freq: 90, type: "sine", gain: 0.03 },
    dragging: { freq: 45, type: "square", gain: 0.025, pulse: true },
    buzz: { freq: 58, type: "sawtooth", gain: 0.02 },
    heartbeat: { freq: 70, type: "sine", gain: 0.045, pulse: true },
    footsteps: { freq: 120, type: "triangle", gain: 0.025, pulse: true },
    ending: { freq: 110, type: "sine", gain: 0.008 }
  },
  defaults: {
    masterVolume: 1,
    musicVolume: 0.75,
    sfxVolume: 0.85
  }
};
