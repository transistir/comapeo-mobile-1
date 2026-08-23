---
name: comapeo-storybook-capture
description: Generate and verify CoMapeo React Native Storybook flow screenshots with deterministic readiness and durable acceptance evidence.
---

# CoMapeo Storybook capture

The golden path, the disposable-emulator notes, the CI build gotchas, and the
offline checks that save a 30-50 minute CI cycle all live in
[`docs/storybook-capture.md`](../../../docs/storybook-capture.md). Read that
file — it is the source of truth, and it is kept harness-neutral so every
agent tool working in this repo reads the same instructions.

To run this as a gate on a pull request — capture, review every frame with
vision, fix, and comment with the artifact link — see the
`comapeo-storybook-capture-gate` skill and
[`docs/storybook-capture-gate.md`](../../../docs/storybook-capture-gate.md).
