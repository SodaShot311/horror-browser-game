(() => {
  const defaultState = () => ({
    sceneId: "leavingWork",
    fear: 0,
    battery: 15,
    clues: {},
    inventory: [],
    settings: {
      reducedMotion: false,
      skipTypewriter: false
    }
  });

  let state = defaultState();

  const newGameButton = document.getElementById("newGameButton");
  const continueButton = document.getElementById("continueButton");
  const resetButton = document.getElementById("resetButton");
  const menuButton = document.getElementById("menuButton");
  const muteButton = document.getElementById("muteButton");
  const skipButton = document.getElementById("skipButton");
  const reducedMotionToggle = document.getElementById("reducedMotionToggle");
  const skipTypeToggle = document.getElementById("skipTypeToggle");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const achievementsButton = document.getElementById("achievementsButton");
  const closeEndingsButton = document.getElementById("closeEndingsButton");

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mergeSettings() {
    state.settings = { ...defaultState().settings, ...Save.loadSettings(), ...state.settings };
    document.body.classList.toggle("reduce-motion", state.settings.reducedMotion);
    reducedMotionToggle.checked = state.settings.reducedMotion;
    skipTypeToggle.checked = state.settings.skipTypewriter;
  }

  function startFresh() {
    const settings = { ...state.settings };
    state = defaultState();
    state.settings = settings;
    renderCurrent();
  }

  function continueGame() {
    const saved = Save.load();
    if (saved) state = { ...defaultState(), ...saved };
    mergeSettings();
    renderCurrent();
  }

  function save() {
    Save.save(state);
  }

  function unlockSceneRewards(scene) {
    if (scene.clue) state.clues[scene.clue] = true;
    if (scene.item && !state.inventory.includes(scene.item)) state.inventory.push(scene.item);
  }

  function applyChoice(choice) {
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
      Save.unlockEnding(scene.ending);
      Save.clear();
    } else {
      save();
    }

    scene = maybeAddHallucinationChoices(maybeWhisper(scene));
    UI.render(scene, state, { choose: applyChoice });
    AudioEngine.play(scene.effects?.sound);
  }

  function applySettings() {
    state.settings.reducedMotion = reducedMotionToggle.checked;
    state.settings.skipTypewriter = skipTypeToggle.checked;
    document.body.classList.toggle("reduce-motion", state.settings.reducedMotion);
    Save.saveSettings(state.settings);
    if (!document.getElementById("gameScreen").classList.contains("hidden")) save();
  }

  newGameButton.addEventListener("click", startFresh);
  continueButton.addEventListener("click", continueGame);
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
  skipButton.addEventListener("click", UI.finishTypewriter);
  reducedMotionToggle.addEventListener("change", applySettings);
  skipTypeToggle.addEventListener("change", applySettings);
  fullscreenButton.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  });
  achievementsButton.addEventListener("click", () => UI.renderEndings(Save.loadEndings()));
  closeEndingsButton.addEventListener("click", () => document.getElementById("endingDialog").close());

  state.settings = { ...state.settings, ...Save.loadSettings() };
  mergeSettings();
  UI.showTitle(Boolean(Save.load()));
})();
