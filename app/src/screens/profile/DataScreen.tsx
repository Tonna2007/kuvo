import { Zap } from 'lucide-react-native';
import { Screen } from '../../components/ui/Screen';
import { SettingRow } from '../../components/ui/SettingRow';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { ToggleRow } from '../../components/ui/ToggleRow';
import { useApp } from '../../context/AppContext';
import type { RootScreenProps } from '../../navigation/types';
import { useColors } from '../../theme';

export function DataScreen({ navigation }: RootScreenProps<'Data'>) {
  const { profile, patchProfile } = useApp();
  const colors = useColors();

  return (
    <Screen>
      <SubscreenHeader title="Data & low bandwidth" onBack={() => navigation.goBack()} />
      <ToggleRow
        label="Low data mode"
        description="Compresses media and pauses auto-download on weak networks"
        value={profile.lowDataMode}
        onValueChange={(lowDataMode) => patchProfile({ lowDataMode })}
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
      <SettingRow
        icon={<Zap size={16} color={colors.green} strokeWidth={2} />}
        label="Storage used"
        hint="128 MB of media"
        chevron={false}
      />
    </Screen>
  );
}
