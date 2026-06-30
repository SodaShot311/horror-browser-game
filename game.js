(() => {
  const defaultState = () => ({
    sceneId: "leavingWork",
    fear: 0,
    battery: 15,
    clues: {},
    inventory: [],
    playtime: 0,
    settings: {
      reducedMotion: false,
      skipTypewriter: false,
      masterVolume: 1,
      musicVolume: 0.75,
      sfxVolume: 0.85,
      textSpeed: 22,
      crt: true,
      fog: true,
      animations: true,
      fontSize: 100,
      language: "en"
    }
  });

  let state = defaultState();
  let endingInProgress = false;
  let startedAt = Date.now();

  const newGameButton = document.getElementById("newGameButton");
  const continueButton = document.getElementById("continueButton");
  const resetButton = document.getElementById("resetButton");
  const slotsButton = document.getElementById("slotsButton");
  const gameSlotsButton = document.getElementById("gameSlotsButton");
  const menuButton = document.getElementById("menuButton");
  const muteButton = document.getElementById("muteButton");
  const skipButton = document.getElementById("skipButton");
  const manualSaveButton = document.getElementById("manualSaveButton");
  const quickSaveButton = document.getElementById("quickSaveButton");
  const quickLoadButton = document.getElementById("quickLoadButton");
  const exportSaveButton = document.getElementById("exportSaveButton");
  const importSaveInput = document.getElementById("importSaveInput");
  const reducedMotionToggle = document.getElementById("reducedMotionToggle");
  const skipTypeToggle = document.getElementById("skipTypeToggle");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const achievementsButton = document.getElementById("achievementsButton");
  const closeEndingsButton = document.getElementById("closeEndingsButton");
  const closeSaveDialogButton = document.getElementById("closeSaveDialogButton");

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function tickPlaytime() {
    state.playtime = Math.round((Date.now() - startedAt) / 1000);
  }

  function mergeSettings() {
    state.settings = { ...defaultState().settings, ...Save.loadSettings(), ...state.settings };
    window.ThemeManager.apply(state.settings);
    AudioEngine.applySettings(state.settings);
    reducedMotionToggle.checked = state.settings.reducedMotion;
    skipTypeToggle.checked = state.settings.skipTypewriter;
  }

  function loadSnapshot(saved) {
    if (!saved) return false;
    state = {
      ...defaultState(),
      ...saved,
      clues: { ...saved.clues },
      inventory: [...(saved.inventory || [])],
      settings: { ...defaultState().settings, ...(saved.settings || {}) }
    };
    startedAt = Date.now() - (state.playtime || 0) * 1000;
    mergeSettings();
    renderCurrent();
    return true;
  }

  function startFresh() {
    endingInProgress = false;
    const settings = { ...state.settings };
    state = defaultState();
    state.settings = settings;
    startedAt = Date.now();
    renderCurrent();
  }

  function continueGame() {
    if (endingInProgress) return;
    loadSnapshot(Save.load());
  }

  function save() {
    tickPlaytime();
    Save.save(state);
  }

  function manualSave() {
    tickPlaytime();
    window.SaveManager.saveSlot(state, { name: `Manual Save - ${window.SCENES[state.sceneId]?.title || state.sceneId}` });
    window.NotificationManager.show("Progress saved");
  }

  function quickSave() {
    tickPlaytime();
    window.SaveManager.quickSave(state);
    window.NotificationManager.show("Quick saved");
  }

  function unlockSceneRewards(scene) {
    if (scene.clue) state.clues[scene.clue] = true;
    if (scene.item && !state.inventory.includes(scene.item)) state.inventory.push(scene.item);
  }

  function applyChoice(choice) {
    if (endingInProgress) return;

    if (choice.menu) {
      AudioEngine.stop();
      UI.showTitle(Boolean(Save.load()));
      return;
    }

    if (choice.restart) {
      startFresh();
      return;
    }

    if (choice.endingCheck) {
      state.sceneId = resolveEnding();
      renderCurrent();
      return;
    }

    if (choice.requiresBattery && state.battery <= 0) {
      state.fear = clamp(state.fear + 2, 0, 10);
      state.sceneId = "badEnding";
      renderCurrent();
      return;
    }

    state.fear = clamp(state.fear + (choice.fear || 0), 0, 10);
    state.battery = clamp(state.battery + (choice.battery || 0), 0, 100);
    if (choice.clue) state.clues[choice.clue] = true;
    if (choice.item && !state.inventory.includes(choice.item)) state.inventory.push(choice.item);

    if (state.fear >= 10 && Math.random() < 0.25) {
      state.sceneId = "badEnding";
    } else if (state.battery <= 0 && choice.requiresBattery) {
      state.sceneId = "badEnding";
    } else {
      state.sceneId = choice.next;
    }
    renderCurrent();
  }

  function resolveEnding() {
    const hasAllClues = ["FoundWorkerID", "ReadNewspaper", "SawGhost", "FoundLuckyCharm"]
      .every(clue => state.clues[clue]);
    if (hasAllClues && state.fear < 5 && state.battery > 0) return "goodEnding";
    return "badEnding";
  }

  function maybeAddHallucinationChoices(scene) {
    if (state.fear < 8 || scene.ending || scene.choices.some(choice => choice.fake)) return scene;
    return {
      ...scene,
      choices: [
        ...scene.choices,
        { text: "Close your eyes", next: "badEnding", fear: 2, fake: true }
      ]
    };
  }

  function maybeWhisper(scene) {
    if (!scene.randomWhisper || Math.random() > 0.25) return scene;
    return {
      ...scene,
      text: [...scene.text, "Somewhere near your ear, a voice says your apartment number incorrectly."]
    };
  }

  function renderCurrent() {
    let scene = window.SCENES[state.sceneId] || window.SCENES.leavingWork;
    unlockSceneRewards(scene);

    if (scene.ending) {
      startEndingSequence(scene);
      return;
    }

    save();
    scene = maybeAddHallucinationChoices(maybeWhisper(scene));
    UI.render(scene, state, { choose: applyChoice });
    window.AssetManager.preloadChoices(scene);
    AudioEngine.playScene(scene.id, scene.effects?.sound);
  }

  function startEndingSequence(scene) {
    endingInProgress = true;
    Save.unlockEnding(scene.ending);
    Save.clear();
    AudioEngine.fadeOut(1600).then(() => {
      AudioEngine.playScene(scene.id, scene.effects?.sound);
    });
    UI.runEndingSequence(scene, state, resetAfterEnding);
  }

  function resetAfterEnding() {
    const settings = { ...state.settings };
    endingInProgress = false;
    state = defaultState();
    state.settings = settings;
    startedAt = Date.now();
    AudioEngine.stop();
    mergeSettings();
    UI.showTitle(false);
  }

  function applySettings() {
    state.settings.reducedMotion = reducedMotionToggle.checked;
    state.settings.skipTypewriter = skipTypeToggle.checked;
    window.ThemeManager.apply(state.settings);
    AudioEngine.applySettings(state.settings);
    Save.saveSettings(state.settings);
    if (!document.getElementById("gameScreen").classList.contains("hidden")) save();
  }

  function openSaveSlots() {
    UI.renderSaveSlots(window.SaveManager.list(), {
      load(id) {
        document.getElementById("saveDialog").close();
        if (loadSnapshot(window.SaveManager.loadSlot(id))) window.NotificationManager.show("Save loaded");
      },
      rename(id) {
        const current = window.SaveManager.loadSlot(id);
        const name = prompt("Rename save slot", current?.name || "Save");
        if (name !== null) {
          window.SaveManager.renameSlot(id, name);
          openSaveSlots();
        }
      },
      remove(id) {
        window.SaveManager.deleteSlot(id);
        window.NotificationManager.show("Save deleted");
        openSaveSlots();
      }
    });
  }

  function exportSave() {
    const json = window.SaveManager.exportSlot();
    if (!json) {
      window.NotificationManager.show("No save to export");
      return;
    }
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "the-long-walk-home-save.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importSave(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = window.SaveManager.importSlot(String(reader.result || ""));
      window.NotificationManager.show(imported ? "Save imported" : "Import failed");
      UI.showTitle(Boolean(Save.load()));
    };
    reader.readAsText(file);
  }

  newGameButton.addEventListener("click", startFresh);
  continueButton.addEventListener("click", continueGame);
  slotsButton.addEventListener("click", openSaveSlots);
  gameSlotsButton.addEventListener("click", openSaveSlots);
  resetButton.addEventListener("click", () => {
    Save.clear();
    UI.showTitle(false);
  });
  menuButton.addEventListener("click", () => {
    save();
    AudioEngine.stop();
    UI.showTitle(true);
  });
  muteButton.addEventListener("click", () => {
    const muted = AudioEngine.toggleMute();
    muteButton.textContent = muted ? "Sound Off" : "Sound On";
  });
  manualSaveButton.addEventListener("click", manualSave);
  quickSaveButton.addEventListener("click", quickSave);
  quickLoadButton.addEventListener("click", () => {
    if (loadSnapshot(window.SaveManager.loadSlot("quick"))) window.NotificationManager.show("Quick loaded");
    else window.NotificationManager.show("No quick save");
  });
  exportSaveButton.addEventListener("click", exportSave);
  importSaveInput.addEventListener("change", event => importSave(event.target.files[0]));
  skipButton.addEventListener("click", UI.finishTypewriter);
  reducedMotionToggle.addEventListener("change", applySettings);
  skipTypeToggle.addEventListener("change", applySettings);
  fullscreenButton.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  });
  achievementsButton.addEventListener("click", () => UI.renderEndings(Save.loadEndings()));
  closeEndingsButton.addEventListener("click", () => document.getElementById("endingDialog").close());
  closeSaveDialogButton.addEventListener("click", () => document.getElementById("saveDialog").close());

  state.settings = { ...state.settings, ...Save.loadSettings() };
  mergeSettings();
})();
