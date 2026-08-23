import type {Meta, StoryObj} from '@storybook/react-native';

import {WifiCard} from './WifiCard';
import {withFlowState} from '../../../../.rnstorybook/decorators/withFlowState';

/**
 * Leaf stories. `WifiCard` is purely presentational (no hooks) — it takes
 * the resolved `ssid` as a prop rather than reading WiFi state itself, so
 * these fixture both real-world states directly instead of relying on the
 * CI emulator's actual (unseedable) WiFi radio status. Readiness uses the
 * component's own existing `wifi-icon`/`no-wifi-icon` testIDs; no app
 * source changes needed. `withFlowState` (with no `flow.state`) supplies
 * the `STORYBOOK.flow-ready.<story_id>` marker the capture pipeline
 * requires for every manifest row.
 */
const meta = {
  title: 'Exchange/WifiCard',
  component: WifiCard,
  decorators: [withFlowState],
} satisfies Meta<typeof WifiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 01 Connected to a named WiFi network. */
export const WifiConnected: Story = {
  name: '01 Wifi Connected',
  args: {
    ssid: 'Storybook Network',
  },
};

/** 02 No WiFi connection (`ssid` is `null`). */
export const WifiDisconnected: Story = {
  name: '02 Wifi Disconnected',
  args: {
    ssid: null,
  },
};
