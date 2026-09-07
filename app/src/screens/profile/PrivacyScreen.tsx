import { Ban } from 'lucide-react-native';
import { Screen } from '../../components/ui/Screen';
import { SettingRow } from '../../components/ui/SettingRow';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { ToggleRow } from '../../components/ui/ToggleRow';
import { useApp } from '../../context/AppContext';
import type { RootScreenProps } from '../../navigation/types';
import { useColors } from '../../theme';

export function PrivacyScreen({ navigation }: RootScreenProps<'Privacy'>) {
  const { profile, patchProfile } = useApp();
  const colors = useColors();

  return (
    <Screen>
      <SubscreenHeader title="Privacy & data" onBack={() => navigation.goBack()} />
      <ToggleRow
        label="Show last seen"
        description="Others can see when you were last online"
        value={profile.showLastSeen}
        onValueChange={(showLastSeen) => patchProfile({ showLastSeen })}
      />
      <ToggleRow
        label="Read receipts"
        description="Send blue ticks when you've read a message"
        value={profile.readReceipts}
        onValueChange={(readReceipts) => patchProfile({ readReceipts })}
      />
      <ToggleRow
        label="Show campus badge"
        description="Display your verified campus on your profile"
        value={profile.showCampusBadge}
        onValueChange={(showCampusBadge) => patchProfile({ showCampusBadge })}
      />
      <SettingRow
        icon={<Ban size={16} color={colors.green} strokeWidth={2} />}
        label="Blocked contacts"
        hint={`${profile.blockedCount} blocked`}
        chevron={false}
      />
      <ToggleRow
        label="Low data mode"
        description="Compresses media and pauses auto-download on weak networks"
        value={profile.lowDataMode}
        onValueChange={(lowDataMode) => patchProfile({ lowDataMode })}
      />
      <ToggleRow
        label="Two-step verification"
        description="Extra PIN required when registering this number again"
        value={profile.twoStep}
        onValueChange={(twoStep) => patchProfile({ twoStep })}
      />
      <ToggleRow
        label="Auto-download photos"
        value={profile.autoDownloadPhotos}
        onValueChange={(autoDownloadPhotos) => patchProfile({ autoDownloadPhotos })}
      />
      <ToggleRow
        label="Auto-download documents"
        value={profile.autoDownloadDocuments}
        onValueChange={(autoDownloadDocuments) => patchProfile({ autoDownloadDocuments })}
      />
    </Screen>
  );
}
