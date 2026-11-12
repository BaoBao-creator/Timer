(() => {
  "use strict";

  const HOLD_THRESHOLD_MS = 500;
  const STORAGE_KEY = "rubik-timer-settings";
  const PHASE = Object.freeze({
    IDLE: "idle",
    HOLDING: "holding",
    READY: "ready",
    RUNNING: "running",
    STOPPED: "stopped"
  });

  const FONT_OPTIONS = new Set(["modern", "classic", "elegant", "mono", "seven"]);
  const DEFAULT_SETTINGS = Object.freeze({
    background: "#f3efe7",
    timerColor: "#293448",
    font: "modern"
  });

  const surface = document.getElementById("timer-surface");
  const timerDisplay = document.getElementById("timer");
  const settingsButton = document.getElementById("settings-button");
  const settingsPanel = document.getElementById("settings-panel");
  const closeSettingsButton = document.getElementById("close-settings");
  const backgroundInput = document.getElementById("background-color");
  const timerColorInput = document.getElementById("timer-color");
  const fontSelect = document.getElementById("font-style");

  if (!surface || !timerDisplay || !settingsButton || !settingsPanel
    || !closeSettingsButton || !backgroundInput || !timerColorInput || !fontSelect) {
    console.error("Rubik Timer: required UI elements are missing.");
    return;
  }

  const state = {
    phase: PHASE.IDLE,
    phaseBeforeHold: PHASE.IDLE,
    holdSource: null,
    activePointerId: null,
    holdStartedAt: 0,
    holdTimeoutId: null,
    startedAt: 0,
    elapsedMs: 0,
    animationFrameId: 0,
    lastRenderedCentisecond: -1,
    settingsOpen: false,
    segmentPattern: "",
    segmentDigits: []
  };

  function isHexColor(value) {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
  }

  function loadSettings() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (!stored || typeof stored !== "object") return { ...DEFAULT_SETTINGS };

      return {
        background: isHexColor(stored.background)
          ? stored.background : DEFAULT_SETTINGS.background,
        timerColor: isHexColor(stored.timerColor)
          ? stored.timerColor : DEFAULT_SETTINGS.timerColor,
        font: FONT_OPTIONS.has(stored.font) ? stored.font : DEFAULT_SETTINGS.font
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  const settings = loadSettings();

  function saveSettings() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // The current tab still keeps the selected settings if storage is unavailable.
    }
  }

  function applySettings(persist = true) {
    document.documentElement.style.setProperty("--page-background", settings.background);
    document.documentElement.style.setProperty("--timer-color", settings.timerColor);
    timerDisplay.dataset.font = settings.font;

    backgroundInput.value = settings.background;
    timerColorInput.value = settings.timerColor;
    fontSelect.value = settings.font;

    const formatted = formatTime(state.elapsedMs);
    renderTimerValue(formatted);
    timerDisplay.setAttribute("aria-label", "Thời gian: " + formatted);

    if (persist) saveSettings();
  }

  function openSettings() {
    state.settingsOpen = true;
    cancelHold();
    settingsPanel.hidden = false;
    surface.inert = true;
    settingsButton.setAttribute("aria-expanded", "true");
    closeSettingsButton.focus();
  }

  function closeSettings(returnFocus = true) {
    if (!state.settingsOpen) return;

    state.settingsOpen = false;
    settingsPanel.hidden = true;
    surface.inert = false;
    settingsButton.setAttribute("aria-expanded", "false");

    if (returnFocus) settingsButton.focus();
  }

  function formatTime(milliseconds) {
    const centiseconds = Math.floor(Math.max(0, milliseconds) / 10);
    const minutes = Math.floor(centiseconds / 6000);
    const seconds = Math.floor((centiseconds % 6000) / 100);
    const fraction = String(centiseconds % 100).padStart(2, "0");

    if (minutes > 0) {
      return String(minutes) + ":" + String(seconds).padStart(2, "0") + "." + fraction;
    }

    return String(seconds) + "." + fraction;
  }

  function setPhase(phase) {
    state.phase = phase;
    surface.dataset.state = phase;
    timerDisplay.dataset.state = phase;
  }

  const SEGMENT_MAP = Object.freeze([
    "abcdef",
    "bc",
    "abdeg",
    "abcdg",
    "bcfg",
    "acdfg",
    "acdefg",
    "abc",
    "abcdefg",
    "abcdfg"
  ]);
  const SEGMENT_NAMES = ["a", "b", "c", "d", "e", "f", "g"];

  function renderTextTime(formatted) {
    if (timerDisplay.textContent !== formatted) {
      timerDisplay.textContent = formatted;
    }
    state.segmentPattern = "";
    state.segmentDigits = [];
  }

  function renderSevenSegment(formatted) {
    const pattern = Array.from(formatted, (character) =>
      /\d/.test(character) ? "#" : character
    ).join("");

    if (state.segmentPattern !== pattern) {
      const fragment = document.createDocumentFragment();
      const digitRecords = [];

      for (const character of formatted) {
        if (/\d/.test(character)) {
          const digit = document.createElement("span");
          digit.className = "digit";
          digit.setAttribute("aria-hidden", "true");
          const segments = [];

          for (const name of SEGMENT_NAMES) {
            const segment = document.createElement("i");
            segment.className = "segment segment-" + name;
            digit.appendChild(segment);
            segments.push(segment);
          }

          fragment.appendChild(digit);
          digitRecords.push({ segments });
        } else {
          const separator = document.createElement("span");
          separator.className = character === ":"
            ? "separator separator-colon"
            : "separator separator-dot";
          separator.setAttribute("aria-hidden", "true");
          fragment.appendChild(separator);
        }
      }

      timerDisplay.replaceChildren(fragment);
      state.segmentPattern = pattern;
      state.segmentDigits = digitRecords;
    }

    let digitIndex = 0;
    for (const character of formatted) {
      if (!/\d/.test(character)) continue;

      const activeSegments = SEGMENT_MAP[Number(character)];
      const record = state.segmentDigits[digitIndex];
      for (let index = 0; index < SEGMENT_NAMES.length; index += 1) {
        record.segments[index].classList.toggle(
          "is-on",
          activeSegments.includes(SEGMENT_NAMES[index])
        );
      }
      digitIndex += 1;
    }
  }

  function renderTimerValue(formatted) {
    if (settings.font === "seven") {
      renderSevenSegment(formatted);
    } else {
      renderTextTime(formatted);
    }
  }

  function renderTime(milliseconds, force = false) {
    const centiseconds = Math.floor(Math.max(0, milliseconds) / 10);
    if (!force && centiseconds === state.lastRenderedCentisecond) return;

    state.lastRenderedCentisecond = centiseconds;
    const formatted = formatTime(centiseconds * 10);
    renderTimerValue(formatted);
    timerDisplay.setAttribute("aria-label", "Thời gian: " + formatted);
  }

  function clearHoldData() {
    if (state.holdTimeoutId !== null) {
      window.clearTimeout(state.holdTimeoutId);
      state.holdTimeoutId = null;
    }

    state.holdSource = null;
    state.activePointerId = null;
    state.holdStartedAt = 0;
  }

  function beginHold(source, pointerId = null) {
    if (state.phase !== PHASE.IDLE && state.phase !== PHASE.STOPPED) return;

    state.phaseBeforeHold = state.phase;
    state.holdSource = source;
    state.activePointerId = pointerId;
    state.holdStartedAt = performance.now();
    setPhase(PHASE.HOLDING);

    state.holdTimeoutId = window.setTimeout(() => {
      if (state.phase === PHASE.HOLDING) setPhase(PHASE.READY);
    }, HOLD_THRESHOLD_MS);
  }

  function cancelHold() {
    if (state.phase !== PHASE.HOLDING && state.phase !== PHASE.READY) return;

    const returnPhase = state.phaseBeforeHold;
    clearHoldData();
    setPhase(returnPhase);
  }

  function startTimer(startTime) {
    clearHoldData();
    state.startedAt = startTime;
    state.elapsedMs = 0;
    state.lastRenderedCentisecond = -1;
    setPhase(PHASE.RUNNING);
    renderTime(0, true);

    if (state.animationFrameId) {
      window.cancelAnimationFrame(state.animationFrameId);
    }
    state.animationFrameId = window.requestAnimationFrame(updateRunningTime);
  }

  function updateRunningTime() {
    if (state.phase !== PHASE.RUNNING) return;

    state.elapsedMs = performance.now() - state.startedAt;
    renderTime(state.elapsedMs);
    state.animationFrameId = window.requestAnimationFrame(updateRunningTime);
  }

  function stopTimer(stopTime = performance.now()) {
    if (state.phase !== PHASE.RUNNING) return;

    state.elapsedMs = Math.max(0, stopTime - state.startedAt);
    if (state.animationFrameId) {
      window.cancelAnimationFrame(state.animationFrameId);
      state.animationFrameId = 0;
    }

    setPhase(PHASE.STOPPED);
    renderTime(state.elapsedMs, true);
  }

  function releaseHold(source, pointerId = null) {
    if ((state.phase !== PHASE.HOLDING && state.phase !== PHASE.READY)
      || state.holdSource !== source) {
      return;
    }

    if (source === "pointer" && state.activePointerId !== pointerId) return;

    const heldFor = performance.now() - state.holdStartedAt;
    const shouldStart = heldFor >= HOLD_THRESHOLD_MS;
    const returnPhase = state.phaseBeforeHold;
    clearHoldData();

    if (shouldStart) {
      startTimer(performance.now());
      return;
    }

    setPhase(returnPhase);
  }

  function isSettingsControl(target) {
    return settingsButton.contains(target) || settingsPanel.contains(target);
  }

  settingsButton.addEventListener("click", () => {
    if (state.settingsOpen) {
      closeSettings();
    } else {
      openSettings();
    }
  });

  closeSettingsButton.addEventListener("click", () => closeSettings());

  settingsPanel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSettings();
    }
  });

  backgroundInput.addEventListener("input", () => {
    if (!isHexColor(backgroundInput.value)) return;
    settings.background = backgroundInput.value;
    applySettings(false);
  });
  backgroundInput.addEventListener("change", saveSettings);

  timerColorInput.addEventListener("input", () => {
    if (!isHexColor(timerColorInput.value)) return;
    settings.timerColor = timerColorInput.value;
    applySettings(false);
  });
  timerColorInput.addEventListener("change", saveSettings);

  fontSelect.addEventListener("change", () => {
    if (!FONT_OPTIONS.has(fontSelect.value)) return;
    settings.font = fontSelect.value;
    applySettings();
  });

  surface.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || state.settingsOpen) return;

    if (state.phase === PHASE.RUNNING) {
      stopTimer();
      return;
    }

    if (state.phase !== PHASE.IDLE && state.phase !== PHASE.STOPPED) return;

    try {
      surface.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture may be unavailable if the pointer is no longer active.
    }

    beginHold("pointer", event.pointerId);
  });

  window.addEventListener("pointerup", (event) => {
    releaseHold("pointer", event.pointerId);
  });

  window.addEventListener("pointercancel", (event) => {
    if (state.holdSource === "pointer" && state.activePointerId === event.pointerId) {
      cancelHold();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.isComposing) return;

    if (event.code === "Escape" && state.settingsOpen) {
      event.preventDefault();
      closeSettings();
      return;
    }

    if (isSettingsControl(event.target)) return;

    if (state.phase === PHASE.RUNNING) {
      if (event.code === "Space") event.preventDefault();
      stopTimer();
      return;
    }

    if (event.code !== "Space" || event.repeat
      || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if (state.phase === PHASE.IDLE || state.phase === PHASE.STOPPED) {
      event.preventDefault();
      beginHold("keyboard");
    }
  });

  window.addEventListener("keyup", (event) => {
    if (isSettingsControl(event.target)) return;
    if (event.code === "Space" && state.holdSource === "keyboard") {
      event.preventDefault();
      releaseHold("keyboard");
    }
  });

  window.addEventListener("blur", cancelHold);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelHold();
      return;
    }

    if (state.phase === PHASE.RUNNING) {
      state.elapsedMs = performance.now() - state.startedAt;
      renderTime(state.elapsedMs);
    }
  });

  applySettings(false);
  setPhase(PHASE.IDLE);
})();
