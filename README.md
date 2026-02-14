![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![Built with A-Frame](https://img.shields.io/badge/A--Frame-1.5.0-black)
![Vite](https://img.shields.io/badge/Vite-5.x-purple)

# XR Target Acquisition Micro-benchmark (Web-based, No Headset)

A bright, desktop-friendly XR-style interaction benchmark designed to measure 3D target acquisition performance without requiring a VR headset.

This tool functions as a lightweight research probe for evaluating desktop-based 3D interaction techniques such as mouse-ray pointing and gaze-based selection. It logs structured performance data and exports research-ready datasets.

---

## Overview

This benchmark presents a sequence of circular 3D targets in front of a fixed camera. The user’s task is simple:

**Click each target as quickly and accurately as possible.**

No walking or movement is required. The camera remains fixed to avoid disorientation and reduce learning effects unrelated to pointing performance.

After completing a trial, performance metrics and logs can be exported as JSON or CSV.

---

## Experimental Controls (Menu Explained)

### Interaction Mode

**Mouse Ray (Desktop-friendly)**
- Uses the mouse pointer to cast a ray into the 3D scene.
- Most natural for desktop users.
- Suitable for usability benchmarking.

**Center Gaze (VR-like)**
- Uses a fixed crosshair at the center of the screen.
- User aligns the reticle with the target and clicks.
- Simulates headset-style gaze interaction.

Use this setting to compare desktop pointing versus VR-like interaction paradigms.

---

### Number of Targets

Defines how many targets appear in a single trial (range: 10–60).

Higher values:
- Increase statistical reliability
- Increase fatigue

Lower values:
- Faster runs
- Suitable for pilot studies

---

### Target Size

**Large**
- Easier to hit
- Lower expected error rate
- Shorter reaction time

**Small**
- Harder to hit
- Higher precision demand
- Increased motor difficulty

Useful for Fitts’-law-style comparisons and difficulty manipulation.

---

### Depth

**Near**
- Target appears closer to the user
- Larger perceived visual angle

**Far**
- Target appears further away
- Smaller perceived visual angle
- Increased spatial difficulty

Allows controlled manipulation of perceived depth in 3D space.

---

## Metrics Logged

Per trial:
- duration_ms
- hits
- misses
- mean_reaction_ms
- mean_offset_m (approximate selection precision)

Event stream:
- START
- TARGET_SHOWN
- TARGET_HIT
- MISS_CLICK
- END
- SURVEY

Survey (post-trial):
- Ease of understanding
- Perceived efficiency
- Perceived control

---

## Data Export

After completing a trial, you can download:

**JSON Log**
- Full event-level dataset (event stream + metadata)
- Suitable for detailed research analysis

**CSV Summary**
- Aggregated trial-level metrics
- Suitable for quick statistical comparison

---

## Installation

Install dependencies:

    npm install

Run development server:

    npm run dev

Open:

    http://localhost:5173

---

## Build and Preview

Build production version:

    npm run build

Preview build:

    npm run preview

Open:

    http://localhost:4173

---

## Run Tests

Run unit tests:

    npm test

Run E2E smoke test (preview must be running):

    npm run preview
    npm run test:e2e

---

## Technical Stack

- A-Frame (MIT License)
- three.js (MIT License, via A-Frame)
- Vite (MIT License)
- Vitest (MIT License)
- Playwright (Apache-2.0 License)

---

## Screenshot

![Demo](docs/screenshot.png)

---

## License

MIT License

(Ensure a LICENSE file is included before publishing.)
