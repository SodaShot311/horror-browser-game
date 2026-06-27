const ACTIVE_SAVE_KEY = "longWalkHome.save";
const SAVE_INDEX_KEY = "longWalkHome.saveSlots";
const ENDINGS_KEY = "longWalkHome.endings";
const SETTINGS_KEY = "longWalkHome.settings";
const QUICK_SLOT = "quick";
const AUTO_SLOT = "auto";

window.SaveManager = (() => {
  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function now() {
    return new Date().toISOString();
  }

  function readSlots() {
    return safeParse(localStorage.getItem(SAVE_INDEX_KEY), []);
  }

  function writeSlots(slots) {
    localStorage.setItem(SAVE_INDEX_KEY, JSON.stringify(slots));
  }

  function snapshot(state, meta = {}) {
    return {
      id: meta.id || `slot-${Date.now()}`,
      name: meta.name || "Manual Save",
      timestamp: now(),
      playtime: state.playtime || 0,
      sceneId: state.sceneId,
      chapter: window.SCENES?.[state.sceneId]?.chapter || "",
      fear: state.fear,
      battery: state.battery,
      clues: { ...state.clues },
      inventory: [...state.inventory],
      settings: { ...state.settings },
      mediaState: meta.mediaState || window.AssetManager?.mediaFor(state.sceneId) || null,
      thumbnail: meta.thumbnail || window.AssetManager?.mediaFor(state.sceneId)?.path || ""
    };
  }

  function upsert(save) {
    const slots = readSlots().filter(slot => slot.id !== save.id);
    slots.unshift(save);
    writeSlots(slots);
    localStorage.setItem(ACTIVE_SAVE_KEY, JSON.stringify(save));
    return save;
  }

  function saveSlot(state, options = {}) {
    return upsert(snapshot(state, options));
  }

  function autosave(state) {
    return saveSlot(state, { id: AUTO_SLOT, name: "Autosave" });
  }

  function quickSave(state) {
    return saveSlot(state, { id: QUICK_SLOT, name: "Quick Save" });
  }

  function loadSlot(id) {
    return readSlots().find(slot => slot.id === id) || null;
  }

  function latestPlayable() {
    return readSlots().find(slot => slot.id !== AUTO_SLOT) || loadSlot(AUTO_SLOT);
  }

  function deleteSlot(id) {
    const slots = readSlots().filter(slot => slot.id !== id);
    writeSlots(slots);
    const active = safeParse(localStorage.getItem(ACTIVE_SAVE_KEY), null);
    if (active?.id === id) localStorage.removeItem(ACTIVE_SAVE_KEY);
  }

  function renameSlot(id, name) {
    const slots = readSlots().map(slot => slot.id === id ? { ...slot, name: name.trim() || slot.name } : slot);
    writeSlots(slots);
  }

  function exportSlot(id) {
    const save = loadSlot(id) || latestPlayable();
    if (!save) return "";
    return JSON.stringify({ type: "longWalkHome.save", version: 1, save }, null, 2);
  }

  function importSlot(json) {
    const parsed = safeParse(json, null);
    const imported = parsed?.save || parsed;
    if (!imported?.sceneId || !window.SCENES?.[imported.sceneId]) return null;
    return upsert({
      ...imported,
      id: imported.id || `import-${Date.now()}`,
      name: imported.name || "Imported Save",
      timestamp: now()
    });
  }

  function clearActive() {
    localStorage.removeItem(ACTIVE_SAVE_KEY);
    deleteSlot(AUTO_SLOT);
  }

  function loadEndings() {
    return safeParse(localStorage.getItem(ENDINGS_KEY), []);
  }

  function unlockEnding(name) {
    const endings = new Set(loadEndings());
    endings.add(name);
    localStorage.setItem(ENDINGS_KEY, JSON.stringify([...endings]));
  }

  function loadSettings() {
    return safeParse(localStorage.getItem(SETTINGS_KEY), {});
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  return {
    saveSlot,
    autosave,
    quickSave,
    loadSlot,
    latestPlayable,
    list: readSlots,
    deleteSlot,
    renameSlot,
    exportSlot,
    importSlot,
    clearActive,
    loadEndings,
    unlockEnding,
    loadSettings,
    saveSettings
  };
})();

window.NotificationManager = (() => {
  let timer = null;

  function show(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("visible"), 1800);
  }

  return { show };
})();

window.Save = {
  load() {
    return window.SaveManager.latestPlayable();
  },
  save(state) {
    return window.SaveManager.autosave(state);
  },
  clear() {
    window.SaveManager.clearActive();
  },
  loadEndings: window.SaveManager.loadEndings,
  unlockEnding: window.SaveManager.unlockEnding,
  loadSettings: window.SaveManager.loadSettings,
  saveSettings: window.SaveManager.saveSettings
};
