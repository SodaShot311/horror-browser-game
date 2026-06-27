const SAVE_KEY = "longWalkHome.save";
const ENDINGS_KEY = "longWalkHome.endings";
const SETTINGS_KEY = "longWalkHome.settings";

window.Save = {
  load() {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
  },
  save(state) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  },
  clear() {
    localStorage.removeItem(SAVE_KEY);
  },
  loadEndings() {
    return JSON.parse(localStorage.getItem(ENDINGS_KEY) || "[]");
  },
  unlockEnding(name) {
    const endings = new Set(window.Save.loadEndings());
    endings.add(name);
    localStorage.setItem(ENDINGS_KEY, JSON.stringify([...endings]));
  },
  loadSettings() {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  },
  saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
