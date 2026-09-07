import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/** Lift the composer by the keyboard height only — no extra gap above the IME. */
export function useKeyboardPad() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) => {
      // One-dot lift so the box sits just above the IME, not inside it.
      setHeight(Math.max(0, event.endCoordinates.height) + 10);
    });
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
