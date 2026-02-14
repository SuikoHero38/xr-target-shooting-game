import { Interaction, TargetSize, Depth } from "../bench/constants.js";
import { exportJSON, exportCSVSummary, attachSurvey } from "../bench/logger.js";
import { renderSurvey } from "../bench/survey.js";

export function setupUI() {
  const sys = () => document.querySelector("a-scene")?.systems?.xrbench;

  const statusEl = document.getElementById("status");
  const interactionSelect = document.getElementById("interactionSelect");
  const sizeSelect = document.getElementById("sizeSelect");
  const depthSelect = document.getElementById("depthSelect");
  const nSlider = document.getElementById("nSlider");
  const nVal = document.getElementById("nVal");

  const btnStart = document.getElementById("btnStart");
  const btnReset = document.getElementById("btnReset");
  const btnJSON = document.getElementById("btnDownloadJSON");
  const btnCSV = document.getElementById("btnDownloadCSV");

  const surveyModal = document.getElementById("surveyModal");
  const surveyFormEl = document.getElementById("surveyForm");
  const btnSubmitSurvey = document.getElementById("btnSubmitSurvey");
  const btnSkipSurvey = document.getElementById("btnSkipSurvey");

  let survey = renderSurvey(surveyFormEl);

  function setStatus(text) { statusEl.innerHTML = `Status: ${text}`; }
  function setDownloadsEnabled(enabled) { btnJSON.disabled = !enabled; btnCSV.disabled = !enabled; }
  function showSurvey() {
    survey = renderSurvey(surveyFormEl);
    surveyModal.style.display = "flex";
  }
  function hideSurvey() { surveyModal.style.display = "none"; }

  // Bind UI to system
  const timer = setInterval(() => {
    const s = sys();
    if (!s) return;
    s.bindUI({ setStatus, setDownloadsEnabled, showSurvey });
    clearInterval(timer);
  }, 50);

  // Config controls
  interactionSelect.addEventListener("change", () => {
    const s = sys(); if (!s) return;
    const v = interactionSelect.value;
    s.applyConfig({ interaction: v === Interaction.CENTER_GAZE ? Interaction.CENTER_GAZE : Interaction.MOUSE_RAY });
  });

  sizeSelect.addEventListener("change", () => {
    const s = sys(); if (!s) return;
    const v = sizeSelect.value;
    s.applyConfig({ size: v === TargetSize.SMALL ? TargetSize.SMALL : TargetSize.LARGE });
  });

  depthSelect.addEventListener("change", () => {
    const s = sys(); if (!s) return;
    const v = depthSelect.value;
    s.applyConfig({ depth: v === Depth.FAR ? Depth.FAR : Depth.NEAR });
  });

  nSlider.addEventListener("input", () => {
    nVal.textContent = nSlider.value;
    const s = sys(); if (!s) return;
    s.applyConfig({ nTargets: Number(nSlider.value) });
  });

  // Actions
  btnStart.addEventListener("click", () => { const s = sys(); if (s) s.onStart(); });
  btnReset.addEventListener("click", () => { const s = sys(); if (s) s.onReset(true); });

  btnJSON.addEventListener("click", () => { const s = sys(); if (s) exportJSON(s.logger); });
  btnCSV.addEventListener("click", () => { const s = sys(); if (s) exportCSVSummary(s.logger); });

  btnSubmitSurvey.addEventListener("click", () => {
    const s = sys(); if (!s) return;
    const values = survey.getValues();
    attachSurvey(s.logger, values);
    s.syncUI();
    hideSurvey();
  });

  btnSkipSurvey.addEventListener("click", () => hideSurvey());

  // Initial UI state
  setStatus("idle — click Start Trial");
  setDownloadsEnabled(false);
  nVal.textContent = nSlider.value;
}
