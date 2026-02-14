import { describe, it, expect } from "vitest";
import { createState, configure, start, recordHit, recordMiss, finish } from "../src/bench/state.js";
import { Interaction } from "../src/bench/constants.js";

describe("Benchmark state", () => {
  it("configures only when not running", () => {
    let s = createState();
    s = configure(s, { interaction: Interaction.CENTER_GAZE, nTargets: 30 });
    expect(s.config.interaction).toBe(Interaction.CENTER_GAZE);
    expect(s.config.nTargets).toBe(30);
    s = start(s);
    const s2 = configure(s, { nTargets: 10 });
    expect(s2.config.nTargets).toBe(30);
  });

  it("counts hits and misses", () => {
    let s = start(createState());
    s = recordHit(s);
    s = recordMiss(s);
    expect(s.hits).toBe(1);
    expect(s.misses).toBe(1);
  });

  it("finishes correctly", () => {
    let s = start(createState());
    s = finish(s);
    expect(s.running).toBe(false);
    expect(s.finished).toBe(true);
  });
});
