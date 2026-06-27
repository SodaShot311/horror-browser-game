window.UI = (() => {
  const titleScreen = document.getElementById("titleScreen");
  const gameScreen = document.getElementById("gameScreen");
  const sceneTitle = document.getElementById("sceneTitle");
  const chapterLabel = document.getElementById("chapterLabel");
  const storyText = document.getElementById("storyText");
  const choices = document.getElementById("choices");
  const sceneImage = document.getElementById("sceneImage");
  const fearMeter = document.getElementById("fearMeter");
  const batteryMeter = document.getElementById("batteryMeter");
  const inventoryList = document.getElementById("inventoryList");
  const continueButton = document.getElementById("continueButton");
  const endingDialog = document.getElementById("endingDialog");
  const endingList = document.getElementById("endingList");

  let typingTimer = null;
  let queuedText = "";
  let onComplete = null;

  const fallbackVisual = "assets/visuals/fog-road.gif";

  function showTitle(hasSave) {
    titleScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    continueButton.disabled = !hasSave;
  }

  function showGame() {
    titleScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
  }

  function distort(text, fear) {
    if (fear < 8) return text;
    const marks = ["\u0334", "\u0335", "\u0336"];
    return text.split("").map((char, index) => {
      if (!/[a-z]/i.test(char) || (index + fear) % 9 !== 0) return char;
      return char + marks[(index + fear) % marks.length];
    }).join("");
  }

  function typeText(lines, fear, skipTypewriter, done) {
    clearTimeout(typingTimer);
    queuedText = lines.map(line => `<p>${distort(line, fear)}</p>`).join("");
    onComplete = done;
    storyText.innerHTML = "";
    if (skipTypewriter) {
      finishTypewriter();
      return;
    }

    const plain = lines.join("\n\n");
    let index = 0;
    const tick = () => {
      const visible = plain.slice(0, index).split("\n\n").map(line => `<p>${distort(line, fear)}</p>`).join("");
      storyText.innerHTML = visible;
      index += 1;
      if (index <= plain.length) {
        const char = plain[index - 2] || "";
        const delay = [".", "?", "!"].includes(char) ? 180 : 22;
        typingTimer = setTimeout(tick, delay);
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
    sceneImage.src = scene.visual || window.CUSTOM_VISUALS?.[scene.id] || fallbackVisual;
    sceneImage.alt = `${scene.title} scene visual`;
    renderStatus(state);
    choices.innerHTML = "";

    typeText(scene.text, state.fear, state.settings.skipTypewriter, () => {
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

  return { showTitle, showGame, render, renderStatus, finishTypewriter, renderEndings };
})();
