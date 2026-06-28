// config/audio.js
// ─────────────────────────────────────────────────────────────────────────────
// HOW AUDIO WORKS
//
// There are two ways to provide a sound for a profile name:
//
//   1. Add a file path to the `files` section (real audio file — mp3/ogg/wav).
//      The engine will load and loop that file for any scene that uses the
//      profile name (e.g. ambience: "rain" in config/assets.js).
//
//   2. Leave it out of `files` and keep (or add) a profile in `profiles`.
//      The engine will synthesize the sound with a Web Audio oscillator,
//      exactly as it did before.
//
// You can mix both: some names use files, others use oscillators.
//
// FILE PATHS
//   Put your audio files in:  assets/audio/ambience/   (looping background sounds)
//                             assets/audio/music/      (music tracks)
//                             assets/audio/sfx/        (one-shot effects)
//
//   Then add an entry in `files` below, e.g.:
//     rain: "assets/audio/ambience/rain.mp3"
//
//   You can also supply fallbacks for browser compatibility:
//     rain: ["assets/audio/ambience/rain.ogg", "assets/audio/ambience/rain.mp3"]
//   The engine picks the first format the browser can play.
//
// PROFILE NAMES IN USE (from config/assets.js)
//   ambience: rain, wind, buzz, dragging, heartbeat, footsteps
//   music:    ending
// ─────────────────────────────────────────────────────────────────────────────

window.AudioConfig = {

  // ── Real audio files ─────────────────────────────────────────────────────────
  // Add entries here to replace a synth profile with a real file.
  // Remove or comment out an entry to revert that sound to the oscillator.
  files: {
    rain:       "assets/audio/ambience/rain.mp3",
    friendCall:        "assets/audio/ambience/friend-call.mp3",
    friendCallAgain:   "assets/audio/ambience/friend-call-again.mp3",
    streetlights:      "assets/audio/ambience/streetlights.mp3",
    deadLine:          "assets/audio/ambience/dead-line.mp3",
    convenienceStore:  "assets/audio/ambience/convenience-store.mp3",
    storeCharm:        "assets/audio/ambience/store-charm.mp3",
    //storeGhost:        "assets/audio/ambience/store-ghost.mp3",
    //mainRoad:          "assets/audio/ambience/main-road.mp3",
    //park:              "assets/audio/ambience/park.mp3",
    lobby:             "assets/audio/ambience/lobby.mp3",
    stairs:            "assets/audio/ambience/stairs.mp3",
    elevator:          "assets/audio/ambience/elevator.mp3",
    //peephole:          "assets/audio/ambience/peephole.mp3",
    //endingCheck:       "assets/audio/ambience/ending-check.mp3",
    //goodEnding:        "assets/audio/music/good-ending.mp3",
    //badEnding:         "assets/audio/music/bad-ending.mp3",
  },

  // ── Oscillator fallback profiles ─────────────────────────────────────────────
  // These are used for any profile name NOT listed in `files` above.
  // You can keep them all, or delete the ones you've replaced with real files.
  /*profiles: {
    rain:       { freq: 160, type: "sawtooth",  gain: 0.025 },
    wind:       { freq: 90,  type: "sine",      gain: 0.03  },
    dragging:   { freq: 45,  type: "square",    gain: 0.025, pulse: true },
    buzz:       { freq: 58,  type: "sawtooth",  gain: 0.02  },
    heartbeat:  { freq: 70,  type: "sine",      gain: 0.045, pulse: true },
    footsteps:  { freq: 120, type: "triangle",  gain: 0.025, pulse: true },
    ending:     { freq: 110, type: "sine",      gain: 0.008 },
  },

  defaults: {
    masterVolume: 1,
    musicVolume:  0.75,
    sfxVolume:    0.85,
  },*/
};
