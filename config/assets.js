// config/assets.js
// ─────────────────────────────────────────────────────────────────────────────
// AMBIENCE — two ways to assign sound to a scene:
//
// 1. SINGLE SOUND (original behaviour)
//    ambience: "rain"
//
// 2. MULTIPLE SOUNDS — plays all of them layered simultaneously
//    ambience: ["rain", "wind"]
//    ambience: ["heartbeat", "dripping", "wind"]
//
// Each name in the array maps to an entry in config/audio.js → files (real file)
// or config/audio.js → profiles (oscillator fallback).
//
// SHARING — just use the same name in multiple scenes:
//    leavingWork: { ..., ambience: "rain" },
//    storeCharm:  { ..., ambience: "rain" },   ← same file, zero duplication
//
// SHARING A MIX — same array in multiple scenes:
//    alley:    { ..., ambience: ["heartbeat", "dripping"] },
//    peephole: { ..., ambience: ["heartbeat", "dripping"] },
// ─────────────────────────────────────────────────────────────────────────────

window.AssetConfig = {
  fallback: {
    image:    "assets/images/lone road.png",
    ambience: "wind",
    overlays: ["fog", "crt"]
  },
  scenes: {
    leavingWork:       { image: "assets/images/docking bay.png",        ambience: "rain",                        overlays: ["fog", "crt"] },
    friendCall:        { image: "assets/images/phone call.png",         ambience: "friendCall",                        overlays: ["crt"] },
    friendCallAgain:   { image: "assets/images/phone call.png",         ambience: "friend-call",                    overlays: ["crt"] },
    taxiCancelled:     { image: "assets/images/docking bay.png",        ambience: "rain",                        overlays: ["fog", "crt"] },
    streetlights:      { image: "assets/images/street lights.png",      ambience: "rain",                    overlays: ["fog", "rain", "crt"] },
    alley:             { gif:   "assets/images/alley.png",              ambience: "rain",                   sfx: [{ id: "drag-metal", delay: 250, volume: 0.35 }], overlays: ["fog", "crt"] },
    deadLine:          { image: "assets/images/phone call.png",         ambience: "friend-call",                        overlays: ["crt"] },
    theFog:            { image: "assets/images/lone road.png",          ambience: "rain",                        overlays: ["fog", "crt"] },
    convenienceStore:  { image: "assets/images/convenient store.png",   ambience: "rain",                        overlays: ["crt"] },
    storeCharm:        { image: "assets/images/convenient store.png",   ambience: "rain",                        overlays: ["crt"] },
    storeBattery:      { image: "assets/images/convenient store.png",   ambience: "rain",                   overlays: ["crt"] },
    storeGhost:        { image: "assets/images/convenient store.png",   ambience: "rain",                   overlays: ["crt"] },
    mainRoad:          { image: "assets/images/lone road.png",          ambience: "rain",                        overlays: ["fog", "crt"] },
    park:              { image: "assets/images/park path.png",          ambience: "rain",                   overlays: ["fog", "crt"] },
    waiting:           { image: "assets/images/lone road.png",          ambience: "rain",                   overlays: ["fog", "crt"] },
    apartmentDistrict: { image: "assets/images/apartment district.png", ambience: "rain",                        overlays: ["fog", "crt"] },
    figure:            { image: "assets/images/street figure.png",      ambience: "rain",                   overlays: ["fog", "crt"] },
    figureLight:       { image: "assets/images/street figure.png",      ambience: "rain",                        overlays: ["fog", "crt"] },
    lobby:             { image: "assets/images/apartment lobby.png",    ambience: "lobby",                        overlays: ["crt"] },
    guard:             { image: "assets/images/apartment lobby.png",    ambience: "lobby",                   overlays: ["crt"] },
    guardTruth:        { image: "assets/images/apartment lobby.png",    ambience: "lobby",                   overlays: ["crt"] },
    stairs:            { image: "assets/images/the stairs.png",         ambience: "stairs",                   overlays: ["crt"] },
    elevator:          { image: "assets/images/elevator.png",           ambience: "elevator",                        overlays: ["crt"] },
    hide:              { image: "assets/images/apartment lobby.png",    ambience: "lobby",                    overlays: ["crt"] },
    peephole:          { image: "assets/images/peephole.png",           ambience: "rain",                   overlays: ["crt"] },
    endingCheck:       { image: "assets/images/peephole.png",           ambience: "rain",                   overlays: ["crt"] },
    goodEnding:        { image: "assets/images/good end.png",           music: "rain",                         overlays: ["fog"] },
    badEnding:         { image: "assets/images/bad end.png",            ambience: "rain",  music: "ending",  overlays: ["fog", "crt"] },

    // ── EXAMPLES — delete these or adapt them ──────────────────────────────────

    // Sharing one sound across multiple scenes — just use the same name:
    // theFog and mainRoad already both use "wind" — no change needed.

    // Layering multiple sounds on one scene — use an array:
    // alley:    { gif: "assets/images/alley.png", ambience: ["heartbeat", "dripping"], overlays: ["fog", "crt"] },
    // park:     { image: "assets/images/park path.png", ambience: ["footsteps", "wind", "crickets"], overlays: ["fog", "crt"] },
    // peephole: { image: "assets/images/peephole.png",  ambience: ["heartbeat", "dripping"], overlays: ["crt"] },
  }
};

window.AssetManager = (() => {
  const config = window.AssetConfig;
  const cache  = new Map();

  function sceneBundle(sceneId) {
    return { ...config.fallback, ...(config.scenes[sceneId] || {}) };
  }

  function mediaFor(sceneId) {
    const bundle = sceneBundle(sceneId);
    const path   = bundle.video || bundle.gif || bundle.image || config.fallback.image;
    const type   = bundle.video ? "video" : "image";
    return { path, type, overlays: bundle.overlays || config.fallback.overlays };
  }

  function audioFor(sceneId, fallbackSound) {
    const bundle   = sceneBundle(sceneId);
    // Normalise ambience to always be an array
    const raw      = bundle.ambience || fallbackSound || config.fallback.ambience;
    const ambience = Array.isArray(raw) ? raw : [raw];
    return {
      ambience,               // always an array now — e.g. ["heartbeat"] or ["heartbeat","dripping"]
      music:   bundle.music || null,
      sfx:     bundle.sfx   || []
    };
  }

  function preload(sceneId) {
    const { path, type } = mediaFor(sceneId);
    if (!path || cache.has(path)) return;
    const element = type === "video" ? document.createElement("video") : new Image();
    element.src   = path;
    cache.set(path, element);
  }

  function preloadChoices(scene) {
    (scene.choices || []).forEach(choice => {
      if (choice.next) preload(choice.next);
    });
  }

  return { sceneBundle, mediaFor, audioFor, preload, preloadChoices };
})();
