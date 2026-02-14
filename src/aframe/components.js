import { DEFAULTS, Interaction, TargetSize, Depth } from "../bench/constants.js";
import {
  createState, configure, start as stStart, finish as stFinish,
  setTarget, recordHit, recordMiss, nextIndex, durationMs
} from "../bench/state.js";
import { createLogger, startTrial, log, endTrial } from "../bench/logger.js";

function randIn(min, max) { return min + Math.random() * (max - min); }

function computeTargetParams(cfg) {
  const r = (cfg.size === TargetSize.SMALL) ? 0.12 : 0.20;
  const z = (cfg.depth === Depth.NEAR) ? -1.6 : -2.6;
  // keep in comfortable view box
  const x = randIn(-0.9, 0.9);
  const y = randIn(1.1, 2.1);
  return { r, x, y, z };
}

function setCursorMode(interaction) {
  const cursor = document.querySelector("#cursor");
  if (!cursor) return;

  if (interaction === Interaction.MOUSE_RAY) {
    cursor.setAttribute("rayOrigin", "mouse");
    cursor.setAttribute("raycaster", "objects: .target; far: 50");
    cursor.setAttribute("material", "color: #111");
  } else {
    // center gaze: crosshair at center
    cursor.removeAttribute("rayOrigin"); // default = entity origin
    cursor.setAttribute("raycaster", "objects: .target; far: 50");
    cursor.setAttribute("material", "color: #111");
  }
}

export function installComponents() {
  AFRAME.registerSystem("xrbench", {
    init() {
      this.state = createState();
      this.logger = createLogger();
      this.ui = null;

      this.targetEl = null;
      this.targetRoot = document.querySelector("#targetRoot");

      // Debug for sanity + tests
      window.__gameDebug = {
        getState: () => this.state,
        setConfig: (patch) => { this.applyConfig(patch); },
        start: () => this.onStart(),
        forceFinish: () => this.onFinish()
      };

      // initialize cursor mode
      setCursorMode(DEFAULTS.interaction);
    },

    bindUI(ui) { this.ui = ui; this.syncUI(); },

    applyConfig(patch) {
      this.state = configure(this.state, patch);
      setCursorMode(this.state.config.interaction);
      this.syncUI();
    },

    syncUI() {
      if (!this.ui) return;
      const s = this.state;
      const cfg = s.config;

      if (!s.running && !s.finished) {
        this.ui.setStatus(`idle | interaction=${cfg.interaction} | n=${cfg.nTargets} | size=${cfg.size} | depth=${cfg.depth}`);
      } else if (s.running) {
        this.ui.setStatus(`running | target ${s.idx + 1}/${cfg.nTargets} | hits=${s.hits} | misses=${s.misses}`);
      } else {
        this.ui.setStatus(`finished ✅ | duration=${this.summary?.duration_ms ?? ""}ms | hits=${s.hits} | misses=${s.misses}`);
      }
      this.ui.setDownloadsEnabled(!!this.logger.summary);
    },

    onReset(clearLogger = true) {
      this.summary = null;
      this.state = createState();
      if (clearLogger) this.logger = createLogger();
      this.removeTarget();
      setCursorMode(this.state.config.interaction);
      this.syncUI();
    },

    onStart() {
      this.onReset(true);
      this.state = stStart(this.state);

      startTrial(this.logger, {
        interaction: this.state.config.interaction,
        nTargets: this.state.config.nTargets,
        size: this.state.config.size,
        depth: this.state.config.depth,
        userAgent: navigator.userAgent,
        platform: navigator.platform
      });

      log(this.logger, "TRIAL_BEGIN", {});
      this.spawnNextTarget();
      this.syncUI();
    },

    onFinish() {
      this.state = stFinish(this.state);
      this.removeTarget();

      // compute summary from events
      const samples = this._samples ?? [];
      const mean = (arr) => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : "";
      const meanFloat = (arr) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(3) : "";

      const reactionMsArr = samples.map(s => s.reaction_ms).filter(Number.isFinite);
      const offsetArr = samples.map(s => s.offset_m).filter(Number.isFinite);

      this.summary = {
        duration_ms: durationMs(this.state),
        hits: this.state.hits,
        misses: this.state.misses,
        mean_reaction_ms: mean(reactionMsArr),
        mean_offset_m: meanFloat(offsetArr)
      };

      endTrial(this.logger, this.summary);
      this.syncUI();

      if (this.ui) this.ui.showSurvey();
    },

    removeTarget() {
      if (this.targetEl) {
        this.targetEl.removeEventListener("click", this._onTargetClick);
        this.targetEl.parentNode?.removeChild(this.targetEl);
      }
      this.targetEl = null;
    },

    spawnNextTarget() {
      const cfg = this.state.config;
      if (this.state.idx >= cfg.nTargets) {
        this.onFinish();
        return;
      }

      // pick new target params
      const { r, x, y, z } = computeTargetParams(cfg);
      const targetId = `T${this.state.idx + 1}`;

      // Create target entity
      this.removeTarget();
      const el = document.createElement("a-sphere");
      el.classList.add("target");
      el.setAttribute("radius", r);
      el.setAttribute("position", `${x} ${y} ${z}`);
      el.setAttribute("color", "#1f4bff");
      el.setAttribute("material", "shader: standard; metalness: 0.1; roughness: 0.35; emissive: #0b1a6b; emissiveIntensity: 0.25");

      // Store timing for reaction time
      const tShown = performance.now();
      this.state = setTarget(this.state, { id: targetId, x, y, z, r });
      log(this.logger, "TARGET_SHOWN", { id: targetId, x, y, z, r });

      // Click handler
      this._onTargetClick = () => {
        const tClick = performance.now();
        const reaction_ms = Math.round(tClick - tShown);

        // compute click offset: approximate as distance camera->target center minus radius? (cheap proxy)
        // Better: use raycaster intersection point, but that’s more plumbing. For today, we log proxy.
        const camPos = document.querySelector("#cam")?.object3D?.position ?? new THREE.Vector3(0,1.6,0);
        const tgtPos = el.object3D.position;
        const dist = camPos.distanceTo(tgtPos);
        const offset_m = Math.max(0, dist - Math.abs(z)); // proxy (not perfect, but stable)

        this._samples = this._samples ?? [];
        this._samples.push({ reaction_ms, offset_m: Number(offset_m.toFixed(3)), r, z });

        this.state = recordHit(this.state);
        log(this.logger, "TARGET_HIT", { id: targetId, reaction_ms, offset_m: Number(offset_m.toFixed(3)) });

        this.state = nextIndex(this.state);
        this.spawnNextTarget();
        this.syncUI();
      };

      el.addEventListener("click", (e) => { e.stopPropagation(); this._onTargetClick(); });

      // Miss clicks: clicking scene but not target counts as miss (only while running)
      // We'll attach one global listener (once) and count miss if click happens and target exists.
      if (!this._missListenerAttached) {
        this._missListenerAttached = true;
        const scene = document.querySelector("a-scene");
        scene?.addEventListener("click", () => {
          if (!this.state.running) return;
          // if click occurred but target didn't handle it, count as miss
          // (target stops propagation, so reaching here means not clicked target)
          this.state = recordMiss(this.state);
          log(this.logger, "MISS_CLICK", {});
          this.syncUI();
        });
      }

      this.targetEl = el;
      this.targetRoot?.appendChild(el);
    }
  });
}
