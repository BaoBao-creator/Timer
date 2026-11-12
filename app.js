(() => {
  "use strict";

  const HOLD_THRESHOLD_MS = 500;
  const PHASE = Object.freeze({
    IDLE: "idle",
    HOLDING: "holding",
    READY: "ready",
    RUNNING: "running",
    STOPPED: "stopped"
  });

  const surface = document.getElementById("timer-surface");
  const timerDisplay = document.getElementById("timer");
  const hint = document.getElementById("hint");

  if (!surface || !timerDisplay || !hint) {
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
    lastRenderedCentisecond: -1
  };

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
  }

  function setHint(message) {
    hint.textContent = message;
  }

  function renderTime(milliseconds) {
    const centiseconds = Math.floor(Math.max(0, milliseconds) / 10);
    if (centiseconds === state.lastRenderedCentisecond) return;

    state.lastRenderedCentisecond = centiseconds;
    const formatted = formatTime(centiseconds * 10);
    timerDisplay.textContent = formatted;
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
    setHint("Giữ thêm một chút...");

    state.holdTimeoutId = window.setTimeout(() => {
      if (state.phase !== PHASE.HOLDING) return;
      setPhase(PHASE.READY);
      setHint("Thả ra để bắt đầu");
    }, HOLD_THRESHOLD_MS);
  }

  function cancelHold() {
    if (state.phase !== PHASE.HOLDING && state.phase !== PHASE.READY) return;

    const returnPhase = state.phaseBeforeHold;
    clearHoldData();
    setPhase(returnPhase);
    setHint(returnPhase === PHASE.STOPPED
      ? "Giữ màn hình hoặc phím cách để giải lượt mới"
      : "Nhấn giữ màn hình hoặc phím cách");
  }

  function startTimer(startTime) {
    clearHoldData();
    state.startedAt = startTime;
    state.elapsedMs = 0;
    state.lastRenderedCentisecond = -1;
    setPhase(PHASE.RUNNING);
    setHint("Chạm màn hình hoặc nhấn phím bất kỳ để dừng");
    renderTime(0);

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
    renderTime(state.elapsedMs);
    setHint("Giữ màn hình hoặc phím cách để giải lượt mới");
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
    setHint(returnPhase === PHASE.STOPPED
      ? "Giữ màn hình hoặc phím cách để giải lượt mới"
      : "Nhấn giữ màn hình hoặc phím cách");
  }

  surface.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;

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

  setPhase(PHASE.IDLE);
})();
