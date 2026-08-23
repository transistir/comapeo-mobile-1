import * as React from 'react';
import {View} from 'react-native';

import {VERY_LIGHT_GREY, WHITE} from '../../src/frontend/lib/styles';

/**
 * Wraps a presentational leaf component so its capture reads as a
 * deliberate component swatch rather than a broken screen.
 *
 * Some Storybook leaf stories (e.g. `Exchange/DevicesAvailableHeader`,
 * `Exchange/WifiCard`) exist only to fixture states a real screen can't
 * reach on a CI emulator — they are sub-components of a screen that's
 * already captured properly elsewhere (see `Flows/Exchange`'s
 * `MainScreen`), not screens in their own right. Left to render at their
 * natural size inside `withFlowState`'s `flex: 1` marker view, they end up
 * pinned to the top-left (or top) of an otherwise blank canvas. This
 * centers the child with generous breathing room on the app's real
 * background colour so the capture looks intentional.
 *
 * The child sits on a white card against a tinted page, which is what makes
 * the frame legible as a swatch: a white-on-white centred component still
 * reads as an empty screen with something stranded in it. The tint also
 * means nobody reviewing a filmstrip mistakes one of these for a real app
 * screen, which they are not.
 *
 * `testID` is carried on the root `View` so the capture pipeline's
 * readiness marker (a `testID:...` target from `capture-manifest.tsv`)
 * still resolves.
 */
export const ComponentSwatch = ({
  testID,
  children,
}: {
  testID: string;
  children: React.ReactNode;
}) => {
  return (
    <View
      testID={testID}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: VERY_LIGHT_GREY,
      }}>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 56,
          paddingHorizontal: 24,
          borderRadius: 12,
          backgroundColor: WHITE,
        }}>
        {children}
      </View>
    </View>
  );
};
