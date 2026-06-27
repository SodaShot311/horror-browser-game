window.AssetConfig = {
  fallback: {
    image: "assets/visuals/fog-road.gif",
    ambience: "wind",
    overlays: ["fog", "crt"]
  },
  scenes: {
    leavingWork: { gif: "assets/visuals/loading-bay.gif", ambience: "rain", overlays: ["fog", "crt"] },
    friendCall: { gif: "assets/visuals/phone-call.gif", ambience: "buzz", overlays: ["crt"] },
    friendCallAgain: { gif: "assets/visuals/phone-call.gif", ambience: "dragging", overlays: ["crt"] },
    taxiCancelled: { gif: "assets/visuals/loading-bay.gif", ambience: "buzz", overlays: ["fog", "crt"] },
    streetlights: { gif: "assets/visuals/streetlights.gif", ambience: "dragging", overlays: ["fog", "rain", "crt"] },
    alley: { gif: "assets/visuals/alley.gif", ambience: "heartbeat", sfx: [{ id: "drag-metal", delay: 250, volume: 0.35 }], overlays: ["fog", "crt"] },
    deadLine: { gif: "assets/visuals/phone-call.gif", ambience: "buzz", overlays: ["crt"] },
    theFog: { gif: "assets/visuals/fog-road.gif", ambience: "wind", overlays: ["fog", "crt"] },
    convenienceStore: { gif: "assets/visuals/convenience-store.gif", ambience: "buzz", overlays: ["crt"] },
    storeCharm: { gif: "assets/visuals/convenience-store.gif", ambience: "rain", overlays: ["crt"] },
    storeBattery: { gif: "assets/visuals/convenience-store.gif", ambience: "heartbeat", overlays: ["crt"] },
    storeGhost: { gif: "assets/visuals/convenience-store.gif", ambience: "heartbeat", overlays: ["crt"] },
    mainRoad: { gif: "assets/visuals/fog-road.gif", ambience: "wind", overlays: ["fog", "crt"] },
    park: { gif: "assets/visuals/park-path.gif", ambience: "footsteps", overlays: ["fog", "crt"] },
    waiting: { gif: "assets/visuals/fog-road.gif", ambience: "heartbeat", overlays: ["fog", "crt"] },
    apartmentDistrict: { gif: "assets/visuals/apartment-blocks.gif", ambience: "buzz", overlays: ["fog", "crt"] },
    figure: { gif: "assets/visuals/street-figure.gif", ambience: "heartbeat", overlays: ["fog", "crt"] },
    figureLight: { gif: "assets/visuals/street-figure.gif", ambience: "buzz", overlays: ["fog", "crt"] },
    lobby: { gif: "assets/visuals/lobby.gif", ambience: "buzz", overlays: ["crt"] },
    guard: { gif: "assets/visuals/lobby.gif", ambience: "heartbeat", overlays: ["crt"] },
    guardTruth: { gif: "assets/visuals/lobby.gif", ambience: "heartbeat", overlays: ["crt"] },
    stairs: { gif: "assets/visuals/stairs.gif", ambience: "footsteps", overlays: ["crt"] },
    elevator: { gif: "assets/visuals/elevator.gif", ambience: "buzz", overlays: ["crt"] },
    hide: { gif: "assets/visuals/lobby.gif", ambience: "dragging", overlays: ["crt"] },
    peephole: { gif: "assets/visuals/apartment-door.gif", ambience: "heartbeat", overlays: ["crt"] },
    endingCheck: { gif: "assets/visuals/apartment-door.gif", ambience: "heartbeat", overlays: ["crt"] },
    goodEnding: { gif: "assets/visuals/true-ending.gif", music: "ending", overlays: ["fog"] },
    badEnding: { gif: "assets/visuals/taken-ending.gif", ambience: "dragging", music: "ending", overlays: ["fog", "crt"] }
  }
};

window.AssetManager = (() => {
  const config = window.AssetConfig;
  const cache = new Map();

  function sceneBundle(sceneId) {
    return { ...config.fallback, ...(config.scenes[sceneId] || {}) };
  }

  function mediaFor(sceneId) {
    const bundle = sceneBundle(sceneId);
    const path = bundle.video || bundle.gif || bundle.image || config.fallback.image;
    const type = bundle.video ? "video" : "image";
    return { path, type, overlays: bundle.overlays || config.fallback.overlays };
  }

  function audioFor(sceneId, fallbackSound) {
    const bundle = sceneBundle(sceneId);
    return {
      ambience: bundle.ambience || fallbackSound || config.fallback.ambience,
      music: bundle.music || null,
      sfx: bundle.sfx || []
    };
  }

  function preload(sceneId) {
    const { path, type } = mediaFor(sceneId);
    if (!path || cache.has(path)) return;
    const element = type === "video" ? document.createElement("video") : new Image();
    element.src = path;
    cache.set(path, element);
  }

  function preloadChoices(scene) {
    (scene.choices || []).forEach(choice => {
      if (choice.next) preload(choice.next);
    });
  }

  return { sceneBundle, mediaFor, audioFor, preload, preloadChoices };
})();
