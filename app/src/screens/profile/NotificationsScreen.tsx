import { Screen } from '../../components/ui/Screen';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { ToggleRow } from '../../components/ui/ToggleRow';
import { useApp } from '../../context/AppContext';
import type { RootScreenProps } from '../../navigation/types';

export function NotificationsScreen({ navigation }: RootScreenProps<'Notifications'>) {
  const { profile, patchProfile } = useApp();
  const prefs = profile.notifications;

  function setPref(key: keyof typeof prefs, value: boolean) {
    patchProfile({ notifications: { ...prefs, [key]: value } });
  }

  return (
    <Screen>
      <SubscreenHeader title="Notifications" onBack={() => navigation.goBack()} />
      <ToggleRow
        label="Message notifications"
        value={prefs.messages}
        onValueChange={(value) => setPref('messages', value)}
      />
      <ToggleRow
        label="Group notifications"
        value={prefs.groups}
        onValueChange={(value) => setPref('groups', value)}
      />
      <ToggleRow
        label="Show message preview"
        value={prefs.preview}
        onValueChange={(value) => setPref('preview', value)}
      />
      <ToggleRow label="Sound" value={prefs.sound} onValueChange={(value) => setPref('sound', value)} />
      <ToggleRow
        label="Vibrate"
        value={prefs.vibrate}
        onValueChange={(value) => setPref('vibrate', value)}
      />
    </Screen>
  );
}
