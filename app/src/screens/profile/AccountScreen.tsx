import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { Building2, Mail, Phone } from 'lucide-react-native';
import { Screen } from '../../components/ui/Screen';
import { SettingRow } from '../../components/ui/SettingRow';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { useApp } from '../../context/AppContext';
import { displayPhone } from '../../lib/format';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, spacing, useColors } from '../../theme';

export function AccountScreen({ navigation }: RootScreenProps<'Account'>) {
  const { profile, patchProfile, signOut } = useApp();
  const colors = useColors();

  return (
    <Screen>
      <SubscreenHeader title="Account" onBack={() => navigation.goBack()} />
      <Pressable onPress={() => navigation.navigate('EditProfile')}>
        <SettingRow
          icon={<Phone size={16} color={colors.green} strokeWidth={2} />}
          label="Phone number"
          hint={displayPhone(profile.phone, profile.countryCode)}
          chevron={true}
        />
      </Pressable>
      <Pressable onPress={() => navigation.navigate('EditProfile')}>
        <SettingRow
          icon={<Mail size={16} color={colors.green} strokeWidth={2} />}
          label="School email"
          hint={
            profile.verified
              ? '✓ verified'
              : profile.schoolEmail || 'Not verified'
          }
          chevron={true}
        />
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Campus', { mode: 'settings' })}>
        <SettingRow
          icon={<Building2 size={16} color={colors.green} strokeWidth={2} />}
          label="Campus"
          hint={
            profile.campus
              ? `${profile.campus.name}${profile.verified ? ' ✓' : ''}`
              : 'Not set'
          }
          chevron={true}
        />
      </Pressable>
      <Text style={[styles.dangerHead, { color: colors.textMuted }]}>DANGER ZONE</Text>
      <Text
        style={styles.danger}
        onPress={() =>
          Alert.alert('Log out', 'You’ll need this number and a new code to sign back in.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Log out',
              style: 'destructive',
              onPress: () => {
                void signOut().then(() => navigation.reset({ index: 0, routes: [{ name: 'Splash' }] }));
              },
            },
          ])
        }
      >
        Log out
      </Text>
      <Text
        style={styles.danger}
        onPress={() =>
          Alert.alert('Delete my account', 'This stays a preview action until the backend is wired.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive' },
          ])
        }
      >
        Delete my account
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dangerHead: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.3,
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    paddingBottom: 6,
  },
  danger: {
    fontFamily: fonts.sansSemi,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#C0392B',
    textAlign: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
  },
});
