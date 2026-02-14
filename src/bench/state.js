import { DEFAULTS } from "./constants.js";

export function createState() {
  return {
    running: false,
    finished: false,
    config: { ...DEFAULTS },
    idx: 0,
    hits: 0,
    misses: 0,
    tStart: null,
    currentTarget: null // {id, x,y,z, r}
  };
}

export function configure(state, configPatch) {
  if (state.running) return state; // don't reconfigure mid-run
  return { ...state, config: { ...state.config, ...configPatch } };
}

export function start(state) {
  if (state.running) return state;
  return {
    ...state,
    running: true,
    finished: false,
    idx: 0,
    hits: 0,
    misses: 0,
    tStart: performance.now(),
    currentTarget: null
  };
}

export function finish(state) {
  if (!state.running) return state;
  return { ...state, running: false, finished: true };
}

export function nextIndex(state) {
  return { ...state, idx: state.idx + 1 };
}

export function setTarget(state, target) {
  return { ...state, currentTarget: target };
}

export function recordHit(state) {
  return { ...state, hits: state.hits + 1 };
}

export function recordMiss(state) {
  return { ...state, misses: state.misses + 1 };
}

export function durationMs(state) {
  if (!state.tStart) return 0;
  return Math.round(performance.now() - state.tStart);
}
