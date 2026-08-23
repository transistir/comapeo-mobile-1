import type {Meta, StoryObj} from '@storybook/react-native';
import {withFlowState} from '../../../.rnstorybook/decorators/withFlowState';
import {withNavigation} from '../../../.rnstorybook/decorators/withNavigation';
import {FLOW_STATES} from '../../../.rnstorybook/utils/flowState';
import {ActiveProjectProvider} from '../contexts/ActiveProjectContext';
import {useActiveProjectId} from '../contexts/ActiveProjectIdStoreContext';
import {DrawerMenu} from './DrawerMenu';

/**
 * `DrawerMenu` is not a navigation route — `react-native-drawer-layout`
 * renders it in `src/frontend/Navigation/Tab/index.tsx`, and its
 * open/closed state is component-local `useState` from `useOpenDrawer()`,
 * so `withRealNavigator`'s `initialState` can never open it (see the plan's
 * "Route facts" section). This story instead seeds real backend state with
 * `withFlowState`, then wraps `DrawerMenu` in `ActiveProjectProvider`
 * itself using the resolved `activeProjectId` — mirroring exactly what
 * `RootStackNavigator` does once a project is active (see
 * `src/frontend/Navigation/Stack/index.tsx`).
 *
 * `withNavigation` alone doesn't provide `ActiveProjectProvider` (see that
 * decorator's own docblock), and `fullApp` wouldn't either: `AppProviders`
 * mounts every other app context up front, but `ActiveProjectProvider` is
 * only mounted inside `RootStackNavigator`, conditionally on
 * `activeProjectId` being set. `DrawerMenu` reads `useActiveProject()`
 * (that provider), plus `useNavigationFromRoot()`, `useManyProjects()`,
 * `useProjectRoleAndDetails()`, `useStorageReadingQuery()`, and
 * `useEarlyAccessState()` — all satisfied here, the last three by
 * `AppProviders`/global context, `useManyProjects` by the ambient
 * `ComapeoCoreProvider`, and navigation by `withNavigation`.
 *
 * Readiness marker: reuses the existing `MENU.main-action-button` testID on
 * `DrawerMenu`'s always-rendered footer button, so no app-source change was
 * needed.
 */
function DrawerMenuStory() {
  const activeProjectId = useActiveProjectId();
  if (!activeProjectId) return null;

  return (
    <ActiveProjectProvider activeProjectId={activeProjectId}>
      <DrawerMenu closeMenu={() => {}} />
    </ActiveProjectProvider>
  );
}

const meta = {
  title: 'Menu/DrawerMenu',
  component: DrawerMenuStory,
  decorators: [withFlowState, withNavigation],
} satisfies Meta<typeof DrawerMenuStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The drawer menu rendered against a real seeded onboarded project. */
export const Default: Story = {
  name: '01 Default',
  parameters: {
    flow: {
      state: {
        ...FLOW_STATES.onboardedWithData,
        draftObservation: 'none',
      },
    },
  },
};
