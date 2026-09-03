/**
 * Seed data utilities for Storybook stories.
 *
 * These call the imperative @comapeo/core-react client API (not the
 * suspense-query hooks) so they can be called from `flowState.ts` before a
 * project id is known to exist — `useManyDocs`/`useSingleProject` etc. would
 * suspend or throw if called with an invalid projectId, and flow-state
 * application often runs before any project has been created. Pattern
 * otherwise follows src/frontend/screens/ComapeoSettings/CreateTestData.tsx.
 *
 * Usage: call `ensure()` from `flowState.ts` (or a story's effect). All
 * stories share the same running backend, so data persists between stories.
 * Both hooks are idempotent (see comments below) so re-running the same
 * spec does not keep piling up projects/observations.
 */
import * as React from 'react';
import {useClientApi} from '@comapeo/core-react';
import {lengthToDegrees} from '@turf/helpers';
import {type BBox} from 'geojson';
import type {Preset} from '@comapeo/schema';

import type {Metadata} from '../../src/frontend/sharedTypes';

const DISTANCE_BUFFER_KM = 50;

// Quito, Ecuador — arbitrary but stable center point for seeded observations.
// Real location isn't meaningful for a story; only having *some* valid,
// clustered coordinates is.
const SEED_CENTER = {latitude: -0.1807, longitude: -78.4678};

/**
 * Ensure a project named `name` exists and return its id.
 *
 * Idempotent: looks up an existing project by name before creating one, so
 * re-running with the same name reuses it instead of creating a duplicate.
 */
export function useSeedProject(name: string) {
  const clientApi = useClientApi();

  const ensure = React.useCallback(async (): Promise<string> => {
    const projects = await clientApi.listProjects();
    const existing = projects.find(project => project.name === name);
    if (existing) return existing.projectId;
    return clientApi.createProject({name});
  }, [clientApi, name]);

  return {ensure};
}

/**
 * Ensure at least `count` observations exist in the project passed to
 * `ensure(projectId)` and return the docIds of the first `count` of them,
 * in deterministic seed order for a fresh project (existing ones first,
 * then any newly created ones — see the note at the return).
 *
 * `projectId` is a parameter of `ensure()` rather than of the hook itself so
 * callers can seed a project id that was only just resolved (e.g. by
 * `useSeedProject`) in the same async sequence, without a stale closure.
 *
 * Idempotent: only creates the shortfall between what already exists and
 * `count`, so re-running with the same count is a no-op after the first run.
 */
export function useSeedObservations(count: number, options?: {lang?: string}) {
  const clientApi = useClientApi();
  const lang = options?.lang;

  const ensure = React.useCallback(
    async (projectId: string): Promise<string[]> => {
      const projectApi = await clientApi.getProject(projectId);
      const [existingObservations, presets] = await Promise.all([
        projectApi.observation.getMany({lang}),
        projectApi.preset.getMany({lang}),
      ]);

      const existingIds = existingObservations
        .map(observation => observation.docId)
        .sort();
      const deficit = count - existingIds.length;
      if (deficit <= 0 || presets.length === 0) {
        return existingIds.slice(0, count);
      }

      const distanceBufferDegrees = lengthToDegrees(
        DISTANCE_BUFFER_KM,
        'kilometers',
      );
      const {latitude, longitude} = SEED_CENTER;
      const bbox: BBox = [
        longitude - distanceBufferDegrees,
        latitude - distanceBufferDegrees,
        longitude + distanceBufferDegrees,
        latitude + distanceBufferDegrees,
      ];

      const seedPresets = selectSeedPresets(presets, deficit, {
        existingCount: existingIds.length,
      });

      const tasks: Promise<string>[] = [];
      for (let i = 0; i < deficit; i++) {
        const preset = seedPresets[i];
        if (!preset) continue;

        const {lon, lat} = selectSeedPosition(bbox, existingIds.length + i);

        const metadata: Metadata = {
          manualLocation: false,
          position: {
            mocked: false,
            timestamp: new Date().toISOString(),
            coords: {latitude: lat, longitude: lon},
          },
        };

        const value = {
          schemaName: 'observation' as const,
          attachments: [],
          tags: {...preset.tags, notes: 'Seeded by Storybook'},
          lat,
          lon,
          metadata,
        };

        tasks.push(projectApi.observation.create(value).then(doc => doc.docId));
      }

      const newIds = await Promise.all(tasks);
      // Seed order, not docId order: docIds are generated per project
      // creation, so sorting by them would make `observationIds[0]` a
      // different seeded observation (preset, position) on every capture
      // run. `Promise.all` preserves task order, so a fresh project's ids
      // come back as seed indices 0..n-1; the top-up path keeps
      // session-stable docId order for what already existed.
      return [...existingIds, ...newIds].slice(0, count);
    },
    [clientApi, count, lang],
  );

  return {ensure};
}

/**
 * Order presets the same, deterministic way everywhere they need a stable
 * order: by `name` (a code unit compare, not `localeCompare`, whose ordering
 * depends on the ICU data available to the runtime), breaking ties on
 * `docId`. `docId` is generated when a project's config is written, so it
 * differs on every capture run; `name` comes from the config itself and
 * survives project re-creation, which is what makes an ordering built on it
 * reproducible across runs.
 */
function comparePresetsByName(a: Preset, b: Preset): number {
  if (a.name !== b.name) return a.name < b.name ? -1 : 1;
  if (a.docId !== b.docId) return a.docId < b.docId ? -1 : 1;
  return 0;
}

/**
 * Pick the point preset a draft-backed flow story should render, from the
 * presets a project's config exposes.
 *
 * Deterministic *across* capture runs, not just within one — see
 * `comparePresetsByName`.
 */
export function selectPointPreset(
  presets: ReadonlyArray<Preset>,
  options?: {requireFields?: boolean},
): Preset | undefined {
  const requireFields = options?.requireFields ?? false;

  return presets
    .filter(
      preset =>
        preset.geometry.includes('point') &&
        (!requireFields || preset.fieldRefs.length > 0),
    )
    .sort(comparePresetsByName)[0];
}

/**
 * Pick the presets `useSeedObservations` should apply to `count` newly
 * seeded observations, by index into a name-sorted list (see
 * `comparePresetsByName`) rather than `Math.random()`. `existingCount` offsets
 * the index so a second seeding pass — topping up a project that already has
 * some seeded observations — continues the rotation instead of restarting it.
 *
 * Wraps around with `%` when there are fewer eligible presets than
 * observations to seed, so the result is always `count` presets long (never
 * empty unless `presets` itself is empty), and still varies between
 * observations whenever more than one preset is eligible.
 */
export function selectSeedPresets(
  presets: ReadonlyArray<Preset>,
  count: number,
  options?: {existingCount?: number},
): Preset[] {
  const existingCount = options?.existingCount ?? 0;
  const sorted = [...presets].sort(comparePresetsByName);
  if (sorted.length === 0) return [];

  const result: Preset[] = [];
  for (let i = 0; i < count; i++) {
    const selected = sorted[(existingCount + i) % sorted.length];
    if (selected) result.push(selected);
  }
  return result;
}

/**
 * Halton sequence value for `index` in prime `base`, in the open interval
 * (0, 1). A low-discrepancy sequence: successive indices fill the interval
 * evenly rather than clustering or repeating the way a naive hash of `index`
 * would.
 */
function halton(index: number, base: number): number {
  let result = 0;
  let fraction = 1 / base;
  let i = index;
  while (i > 0) {
    result += fraction * (i % base);
    i = Math.floor(i / base);
    fraction /= base;
  }
  return result;
}

/**
 * Deterministic replacement for `randomPosition({bbox})`: the `index`-th
 * point of a 2D Halton sequence (bases 2 and 3, the standard low-discrepancy
 * pairing) mapped onto `bbox`. Successive indices land at well-separated
 * points inside the box and repeat exactly on every call, unlike
 * `Math.random()`-backed sampling.
 */
export function selectSeedPosition(
  bbox: BBox,
  index: number,
): {lon: number; lat: number} {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  // Halton sequences start at index 1; index 0 degenerates to (0, 0) in
  // every base.
  const i = index + 1;
  return {
    lon: minLon + halton(i, 2) * (maxLon - minLon),
    lat: minLat + halton(i, 3) * (maxLat - minLat),
  };
}

/**
 * Resolve the deterministic point preset used by draft-backed flow stories.
 * This only reads project config; applying the preset remains the draft
 * store's responsibility.
 */
export function useSeedPointPreset(options?: {
  lang?: string;
  requireFields?: boolean;
}) {
  const clientApi = useClientApi();
  const lang = options?.lang;
  const requireFields = options?.requireFields ?? false;

  const resolve = React.useCallback(
    async (projectId: string): Promise<Preset> => {
      const projectApi = await clientApi.getProject(projectId);
      const presets = await projectApi.preset.getMany({lang});
      const preset = selectPointPreset(presets, {requireFields});

      if (!preset) {
        throw new Error(
          requireFields
            ? `Storybook flow could not find a point preset with fields in project ${projectId}`
            : `Storybook flow could not find a point preset in project ${projectId}`,
        );
      }

      return preset;
    },
    [clientApi, lang, requireFields],
  );

  return {resolve};
}
