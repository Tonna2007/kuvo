import { StyleSheet, Switch, Text, View } from 'react-native';
import { BackRow } from '../../components/ui/BackRow';
import { Screen } from '../../components/ui/Screen';
import { useApp } from '../../context/AppContext';
import { settings } from '../../data/settings';
import { displayPhone } from '../../lib/format';
import type { RootScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';

const copy: Record<string, string> = {
  privacy: 'Phone numbers stay private unless you share them. Campus badges only show after verify. Low data mode hides photos in chats and keeps the campus feed light.',
  notifications: 'Mute noisy groups without leaving them. Delivery settings come with the backend.',
  language: 'English and Naija Pidgin ship in the app. Add another language as a JSON pack — no recoding.',
  help: 'Open Help from Settings for how to chat, call, set wallpaper, and add a language.',
  invite: 'Share your Kuvo username with your hostel group.',
};

export function SettingDetailScreen({ navigation, route }: RootScreenProps<'SettingDetail'>) {
  const { settingId } = route.params;
  const { profile, toggleLowDataMode, patchProfile } = useApp();
  const item = settings.find((setting) => setting.id === settingId);

  return (
    <Screen padded>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>{item?.label ?? 'Settings'}</Text>
      <Text style={styles.body}>{copy[settingId] ?? 'This screen is part of the frontend preview.'}</Text>
      {settingId === 'privacy' ? (
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Low data mode</Text>
          <Switch
            value={profile.lowDataMode}
            onValueChange={toggleLowDataMode}
            trackColor={{ false: colors.border, true: colors.green }}
            thumbColor={colors.white}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.serifSemi,
    fontSize: 24,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 10,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  card: {
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: colors.textDark,
  },
  toggleRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.textDark,
    fontWeight: '600',
  },
});
