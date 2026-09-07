import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackRow } from '../../components/ui/BackRow';
import { GhostButton, PrimaryButton, SecondaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { TextField } from '../../components/ui/TextField';
import { useApp } from '../../context/AppContext';
import { defaultCampus } from '../../data/campuses';
import type { RootScreenProps } from '../../navigation/types';
import { colors, fonts, radii } from '../../theme';

export function VerifyCampusScreen({ navigation, route }: RootScreenProps<'Verify'>) {
  const { profile, patchProfile } = useApp();
  const settingsMode = route.params?.mode === 'settings';
  const [email, setEmail] = useState(profile.schoolEmail || '');
  const campus = profile.campus ?? defaultCampus;

  function enterApp(verified: boolean) {
    patchProfile({
      verified,
      schoolEmail: email.trim() || profile.schoolEmail,
    });
    if (settingsMode) {
      navigation.navigate('EditProfile');
      return;
    }
    navigation.replace('Tabs');
  }

  return (
    <Screen keyboard>
      <ScrollView contentContainerStyle={styles.padded} keyboardShouldPersistTaps="handled">
        <BackRow onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Verify your campus</Text>
        <Text style={styles.sub}>
          Confirmed students get a campus badge and access to campus-only spaces.
        </Text>
        <View style={styles.chip}>
          <View style={styles.chipIcon}>
            <Text style={styles.chipInitials}>{campus.initials}</Text>
          </View>
          <View>
            <Text style={styles.chipName}>{campus.name}</Text>
            <Text style={styles.chipCity}>{campus.city}</Text>
          </View>
        </View>
        <TextField
          label="School email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@kaaf.edu.gh"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PrimaryButton label="Send verification link" onPress={() => enterApp(true)} />
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>
        <SecondaryButton label="Upload student ID instead" onPress={() => enterApp(true)} />
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            You can start chatting before you verify — verifying just unlocks your campus badge and
            campus-only spaces later.
          </Text>
        </View>
        <GhostButton
          label="Skip for now"
          muted
          onPress={() => enterApp(false)}
          style={styles.skip}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: 28,
    paddingBottom: 24,
  },
  title: {
    fontFamily: fonts.serifSemi,
    fontSize: 24,
    fontWeight: '600',
    color: colors.textDark,
    marginTop: 6,
    marginBottom: 8,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.textMuted,
    marginBottom: 18,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  chipIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipInitials: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.white,
    fontWeight: '700',
  },
  chipName: {
    fontFamily: fonts.sansSemi,
    fontSize: 13.5,
    color: colors.textDark,
    fontWeight: '600',
  },
  chipCity: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 18,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  or: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
  },
  hint: {
    backgroundColor: colors.goldLight,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  hintText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.hintText,
  },
  skip: {
    marginTop: 4,
  },
});
