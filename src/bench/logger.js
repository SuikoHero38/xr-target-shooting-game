function nowISO() { return new Date().toISOString(); }

function downloadText(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function createLogger() {
  return { trialId: null, t0: null, meta: null, events: [], summary: null, survey: null };
}

export function startTrial(logger, meta) {
  logger.trialId = nowISO();
  logger.t0 = performance.now();
  logger.meta = meta;
  logger.events = [];
  logger.summary = null;
  logger.survey = null;
  log(logger, "START", {});
}

export function log(logger, type, payload = {}) {
  if (!logger.t0) return;
  logger.events.push({ t: Math.round(performance.now() - logger.t0), type, ...payload });
}

export function endTrial(logger, summary) {
  log(logger, "END", {});
  logger.summary = summary;
}

export function attachSurvey(logger, survey) {
  logger.survey = survey;
  log(logger, "SURVEY", { survey });
}

export function exportJSON(logger) {
  const obj = { trial: { id: logger.trialId, meta: logger.meta, events: logger.events, summary: logger.summary, survey: logger.survey } };
  downloadText(`xrbench_${logger.trialId}.json`, JSON.stringify(obj, null, 2), "application/json");
}

export function exportCSVSummary(logger) {
  const t = logger.trialId ?? "";
  const m = logger.meta ?? {};
  const s = logger.summary ?? {};
  const q = logger.survey ?? {};

  const header = [
    "trial_id","interaction","nTargets","size","depth",
    "duration_ms","hits","misses",
    "mean_reaction_ms","mean_offset_m",
    "survey_ease","survey_efficiency","survey_control"
  ].join(",");

  const row = [
    t,
    m.interaction ?? "",
    m.nTargets ?? "",
    m.size ?? "",
    m.depth ?? "",
    s.duration_ms ?? "",
    s.hits ?? "",
    s.misses ?? "",
    s.mean_reaction_ms ?? "",
    s.mean_offset_m ?? "",
    q.ease ?? "",
    q.efficiency ?? "",
    q.control ?? ""
  ].map(v => `${v}`).join(",");

  downloadText(`xrbench_summary_${t}.csv`, `${header}\n${row}\n`, "text/csv");
}
