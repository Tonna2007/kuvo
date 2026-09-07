import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { BackRow } from '../../components/ui/BackRow';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { TextField } from '../../components/ui/TextField';
import { useApp } from '../../context/AppContext';
import { formatNgPhone } from '../../lib/format';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, useColors } from '../../theme';

export function PhoneScreen({ navigation }: RootScreenProps<'Phone'>) {
  const { profile, setPhone, setCountryCode, requestOtp } = useApp();
  const colors = useColors();
  const [busy, setBusy] = useState(false);

  return (
    <Screen padded keyboard>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.textDark }]}>What's your number?</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        We'll send a code to verify it's you. No one sees this number unless you share it.
      </Text>
      <TextField
        label="Phone number"
        prefix={profile.countryCode}
        onPrefixPress={() => setCountryCode(profile.countryCode === '+234' ? '+233' : '+234')}
        value={formatNgPhone(profile.phone)}
        onChangeText={(value) => setPhone(value.replace(/\D/g, '').slice(0, 10))}
        placeholder="801 234 5678"
        keyboardType="phone-pad"
      />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Tap {profile.countryCode} to switch Nigeria / Ghana.
      </Text>
      <PrimaryButton
        label={busy ? 'Sending…' : 'Send code'}
        disabled={profile.phone.length < 10 || busy}
        onPress={() => {
          void (async () => {
            setBusy(true);
            try {
              await requestOtp();
              navigation.navigate('Otp');
            } catch (err) {
              Alert.alert(
                'Could not send code',
                err instanceof Error ? err.message : 'Check that the API is running and you are on the same Wi‑Fi.',
              );
            } finally {
              setBusy(false);
            }
          })();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.serifSemi,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 8,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 21,
    marginBottom: 26,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
});
