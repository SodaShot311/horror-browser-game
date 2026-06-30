window.UI = (() => {
  const titleScreen = document.getElementById("titleScreen");
  titleScreen.classList.add("hidden");
  const gameScreen = document.getElementById("gameScreen");
  const sceneTitle = document.getElementById("sceneTitle");
  const chapterLabel = document.getElementById("chapterLabel");
  const storyText = document.getElementById("storyText");
  const choices = document.getElementById("choices");
  const sceneVisual = document.getElementById("sceneVisual");
  const thumbnailStrip = document.getElementById("thumbnailStrip");
  const fearMeter = document.getElementById("fearMeter");
  const batteryMeter = document.getElementById("batteryMeter");
  const inventoryList = document.getElementById("inventoryList");
  const continueButton = document.getElementById("continueButton");
  const endingDialog = document.getElementById("endingDialog");
  const endingList = document.getElementById("endingList");
  const saveDialog = document.getElementById("saveDialog");
  const saveList = document.getElementById("saveList");
  const endingSequence = document.getElementById("endingSequence");
  const endingLine = document.getElementById("endingLine");
  const creditsRoll = document.getElementById("creditsRoll");

  let typingTimer = null;
  let queuedText = "";
  let onComplete = null;
  let endingTimer = null;

  // Screen-change hooks: modules (e.g. MenuMusic) can subscribe here instead of
  // monkey-patching UI methods or wiring up their own button listeners.
  const screenListeners = { title: [], game: [] };
  function onScreen(screen, fn) {
    if (screenListeners[screen]) screenListeners[screen].push(fn);
  }
  function emitScreen(screen) {
    (screenListeners[screen] || []).forEach(fn => {
      try { fn(); } catch (err) { console.error(`[UI] screen listener (${screen}) failed:`, err); }
    });
  }

  function clearEndingTimer() {
    if (!endingTimer) return;
    clearTimeout(endingTimer);
    endingTimer = null;
  }

  function wait(ms) {
    return new Promise(resolve => {
      endingTimer = setTimeout(resolve, ms);
    });
  }

  function showTitle(hasSave) {
    clearEndingTimer();
    endingSequence.classList.add("hidden");
    titleScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    continueButton.disabled = !hasSave;
    emitScreen("title");
  }

  function showGame() {
    clearEndingTimer();
    endingSequence.classList.add("hidden");
    titleScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    emitScreen("game");
  }

  function renderMedia(scene) {
    const media = window.AssetManager.mediaFor(scene.id);
    sceneVisual.innerHTML = "";
    sceneVisual.dataset.mediaType = media.type;
    sceneVisual.dataset.overlays = (media.overlays || []).join(" ");

    const element = media.type === "video" ? document.createElement("video") : document.createElement("img");
    element.src = media.path;
    element.alt = `${scene.title} scene visual`;
    element.className = "scene-media";
    element.onerror = () => {
      element.src = window.AssetConfig.fallback.image;
    };
    if (media.type === "video") {
      element.muted = true;
      element.loop = true;
      element.autoplay = true;
      element.playsInline = true;
    }
    sceneVisual.appendChild(element);
  }

  function renderThumbnails(scene) {
    thumbnailStrip.innerHTML = "";
    const nextIds = [...new Set((scene.choices || []).map(choice => choice.next).filter(Boolean))].slice(0, 6);
    nextIds.forEach(sceneId => {
      const nextScene = window.SCENES[sceneId];
      if (!nextScene) return;
      const media = window.AssetManager.mediaFor(sceneId);
      const item = document.createElement("div");
      item.className = "location-thumb";
      item.innerHTML = `<img src="${media.path}" alt=""><span>${nextScene.title}</span>`;
      thumbnailStrip.appendChild(item);
    });
  }

  function distort(text, fear) {
    if (fear < 8) return text;
    const marks = ["\u0334", "\u0335", "\u0336"];
    return text.split("").map((char, index) => {
      if (!/[a-z]/i.test(char) || (index + fear) % 9 !== 0) return char;
      return char + marks[(index + fear) % marks.length];
    }).join("");
  }

  function typeText(lines, fear, settings, done) {
    clearTimeout(typingTimer);
    queuedText = lines.map(line => `<p>${distort(line, fear)}</p>`).join("");
    onComplete = done;
    storyText.innerHTML = "";
    if (settings.skipTypewriter) {
      finishTypewriter();
      return;
    }

    const plain = lines.join("\n\n");
    let index = 0;
    const speed = Math.max(4, Number(settings.textSpeed || 22));
    const tick = () => {
      const visible = plain.slice(0, index).split("\n\n").map(line => `<p>${distort(line, fear)}</p>`).join("");
      storyText.innerHTML = visible;
      index += 1;
      if (index <= plain.length) {
        const char = plain[index - 2] || "";
        typingTimer = setTimeout(tick, [".", "?", "!"].includes(char) ? speed * 7 : speed);
      } else {
        finishTypewriter();
      }
    };
    tick();
  }

  function finishTypewriter() {
    clearTimeout(typingTimer);
    storyText.innerHTML = queuedText;
    if (onComplete) onComplete();
    onComplete = null;
  }

  function render(scene, state, handlers) {
    showGame();
    document.body.dataset.background = scene.effects?.background || "fog";
    document.body.classList.toggle("high-fear", state.fear >= 8);
    document.body.classList.toggle("mid-fear", state.fear >= 5 && state.fear < 8);
    document.body.classList.toggle("screen-shake", Boolean(scene.effects?.shake));

    sceneTitle.textContent = scene.title;
    chapterLabel.textContent = scene.chapter;
    renderMedia(scene);
    renderThumbnails(scene);
    renderStatus(state);
    choices.innerHTML = "";

    typeText(scene.text, state.fear, state.settings, () => {
      choices.innerHTML = "";
      scene.choices.forEach((choice, index) => {
        const button = document.createElement("button");
        button.textContent = choice.fake && state.fear >= 8 ? "Turn around" : choice.text;
        button.addEventListener("click", () => handlers.choose(choice, index));
        choices.appendChild(button);
      });
    });
  }

  function renderStatus(state) {
    const filled = Math.max(0, Math.min(10, state.fear));
    fearMeter.textContent = "#".repeat(filled).padEnd(10, "-");
    batteryMeter.textContent = `${Math.max(0, state.battery)}%`;
    inventoryList.textContent = state.inventory.length ? state.inventory.join(", ") : "Empty";
  }

  function renderEndings(endings) {
    const all = ["Good Ending", "Bad Ending"];
    endingList.innerHTML = "";
    all.forEach(name => {
      const li = document.createElement("li");
      li.textContent = endings.includes(name) ? name : "Unknown";
      endingList.appendChild(li);
    });
    endingDialog.showModal();
  }

  function renderSaveSlots(slots, handlers) {
    saveList.innerHTML = "";
    if (!slots.length) {
      saveList.innerHTML = `<p class="empty-note">No saves yet.</p>`;
    }
    slots.forEach(slot => {
      const row = document.createElement("article");
      row.className = "save-row";
      row.innerHTML = `
        <img src="${slot.thumbnail || window.AssetConfig.fallback.image}" alt="">
        <div>
          <strong>${slot.name}</strong>
          <span>${slot.chapter || ""} - ${slot.sceneId} - ${new Date(slot.timestamp).toLocaleString()}</span>
        </div>
      `;
      const load = document.createElement("button");
      load.textContent = "Load";
      load.addEventListener("click", () => handlers.load(slot.id));
      const rename = document.createElement("button");
      rename.textContent = "Rename";
      rename.addEventListener("click", () => handlers.rename(slot.id));
      const remove = document.createElement("button");
      remove.textContent = "Delete";
      remove.addEventListener("click", () => handlers.remove(slot.id));
      row.append(load, rename, remove);
      saveList.appendChild(row);
    });
    saveDialog.showModal();
  }

  async function runEndingSequence(scene, state, onFinished) {
    clearTimeout(typingTimer);
    clearEndingTimer();
    onComplete = null;
    queuedText = "";
    titleScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    endingSequence.classList.remove("hidden");
    endingSequence.classList.remove("show-credits");
    emitScreen("game"); // leaving the title screen — treat like entering gameplay
    endingLine.className = "ending-line";
    endingLine.textContent = "";
    creditsRoll.classList.add("hidden");
    creditsRoll.innerHTML = "";

    await wait(state.settings.reducedMotion ? 200 : 900);

    const lines = scene.cinematicText || scene.text || [];
    for (const line of lines) {
      endingLine.textContent = line;
      endingLine.classList.add("visible");
      await wait(state.settings.reducedMotion ? 600 : 1900);
      endingLine.classList.remove("visible");
      await wait(state.settings.reducedMotion ? 250 : 750);
    }

    endingLine.textContent = "";
    creditsRoll.innerHTML = (scene.credits || []).map(line => `<p>${line}</p>`).join("");
    creditsRoll.classList.remove("hidden");
    endingSequence.classList.add("show-credits");
    await wait(state.settings.reducedMotion ? 1500 : 7600);
    endingSequence.classList.remove("show-credits");
    creditsRoll.classList.add("hidden");
    await wait(state.settings.reducedMotion ? 300 : 1200);
    endingSequence.classList.add("hidden");
    onFinished();
  }

  return {
    showTitle,
    showGame,
    render,
    renderStatus,
    finishTypewriter,
    renderEndings,
    renderSaveSlots,
    runEndingSequence,
    onScreen
  };
})();

window.UIManager = window.UI;
