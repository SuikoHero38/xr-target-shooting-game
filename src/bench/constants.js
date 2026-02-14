export const Interaction = Object.freeze({
  MOUSE_RAY: "MOUSE_RAY",
  CENTER_GAZE: "CENTER_GAZE"
});

export const TargetSize = Object.freeze({
  LARGE: "LARGE",
  SMALL: "SMALL"
});

export const Depth = Object.freeze({
  NEAR: "NEAR",
  FAR: "FAR"
});

export const DEFAULTS = Object.freeze({
  interaction: Interaction.MOUSE_RAY,
  nTargets: 20,
  size: TargetSize.LARGE,
  depth: Depth.NEAR
});

export const SURVEY_ITEMS = [
  { id: "ease", text: "The task felt easy to understand." },
  { id: "efficiency", text: "The interaction felt efficient." },
  { id: "control", text: "I felt in control and could click accurately." }
];
