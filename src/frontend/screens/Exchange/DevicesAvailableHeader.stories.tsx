import type {Meta, StoryObj} from '@storybook/react-native';
import {View} from 'react-native';

import {DevicesAvailableHeader} from './DevicesAvailableHeader';
import {BLUE_GREY, DARK_ORANGE} from '../../lib/styles';
import {withFlowState} from '../../../../.rnstorybook/decorators/withFlowState';

/**
 * Leaf stories. `DevicesAvailableHeader` is purely presentational (no
 * hooks), so these fixture the exact prop combinations
 * `ExchangeScreenContent` computes from live sync/peer state
 * (`iconColor`/`showOverlay` from `syncStage.connectedPeersCount > 0`,
 * `overlayType` from the device's archive setting) — states that cannot be
 * reproduced deterministically as a flow story on a CI emulator with no
 * real WiFi peers (see `Flows/Exchange`'s `MainScreen` doc comment).
 * A wrapping `testID` view (rather than editing app source) gives the
 * capture pipeline a stable readiness marker for each story's own state,
 * and `withFlowState` supplies the `STORYBOOK.flow-ready.<story_id>` marker
 * every manifest row requires (`scripts/storybook-capture.sh`
 * `native_readiness_matches`) — no `flow.state` needed since these fixture
 * props directly rather than seeding backend state.
 */
const meta = {
  title: 'Exchange/DevicesAvailableHeader',
  component: DevicesAvailableHeader,
  decorators: [withFlowState],
} satisfies Meta<typeof DevicesAvailableHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 01 No devices found: zero connected peers, previews-only device. */
export const NoDevicesFound: Story = {
  name: '01 No Devices Found',
  args: {
    iconColor: BLUE_GREY,
    overlayType: 'leaf',
    showOverlay: false,
  },
  render: args => (
    <View testID="EXCHANGE.devices-available-header">
      <DevicesAvailableHeader {...args} />
    </View>
  ),
};

/** 02 Devices found, previews-only media setting (leaf overlay). */
export const DevicesFoundPreviews: Story = {
  name: '02 Devices Found (Previews Only)',
  args: {
    iconColor: DARK_ORANGE,
    overlayType: 'leaf',
    showOverlay: true,
  },
  render: args => (
    <View testID="EXCHANGE.devices-available-header">
      <DevicesAvailableHeader {...args} />
    </View>
  ),
};

/** 03 Devices found, archive/"everything" media setting (star overlay). */
export const DevicesFoundEverything: Story = {
  name: '03 Devices Found (Exchange Everything)',
  args: {
    iconColor: DARK_ORANGE,
    overlayType: 'star',
    showOverlay: true,
  },
  render: args => (
    <View testID="EXCHANGE.devices-available-header">
      <DevicesAvailableHeader {...args} />
    </View>
  ),
};
