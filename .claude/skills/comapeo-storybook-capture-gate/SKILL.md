---
name: comapeo-storybook-capture-gate
description: Run the Storybook capture workflow for a PR, review every captured frame with vision, fix what it finds, and post the verdict plus an artifact download link on the PR. Use when a PR adds or changes Storybook stories, the capture manifest, or the capture scripts.
---

# Storybook capture gate for a PR

The procedure lives in [`docs/storybook-capture-gate.md`](../../../docs/storybook-capture-gate.md).
Read that file — it is the source of truth, and it is kept harness-neutral so
every agent tool working in this repo reads the same instructions.

In short: the capture workflow is advisory and manually triggered, and its
readiness checks cannot see occlusion — a run has reported 38/38 frames
captured while a stuck keyboard covered ~45% of them. The gate is an agent
running the workflow, looking at every frame, fixing what that finds, and
leaving the verdict and artifact link on the PR.

For the capture pipeline's own mechanics and CI gotchas, see
[`docs/storybook-capture.md`](../../../docs/storybook-capture.md).
