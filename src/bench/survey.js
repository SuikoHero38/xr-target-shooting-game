import { SURVEY_ITEMS } from "./constants.js";

export function renderSurvey(containerEl) {
  containerEl.innerHTML = "";
  const values = {};
  for (const item of SURVEY_ITEMS) values[item.id] = null;

  for (const item of SURVEY_ITEMS) {
    const wrap = document.createElement("div");
    wrap.className = "q";

    const title = document.createElement("b");
    title.textContent = item.text;
    wrap.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "likert";

    for (let i = 1; i <= 7; i++) {
      const lab = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = item.id;
      input.value = String(i);
      input.addEventListener("change", () => { values[item.id] = i; });
      lab.appendChild(input);
      lab.appendChild(document.createTextNode(String(i)));
      grid.appendChild(lab);
    }

    wrap.appendChild(grid);
    containerEl.appendChild(wrap);
  }

  return {
    getValues: () => ({ ...values }),
    isComplete: () => Object.values(values).every(v => Number.isInteger(v))
  };
}
