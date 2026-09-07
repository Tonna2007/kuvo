import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { BackRow } from '../../components/ui/BackRow';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { useApp } from '../../context/AppContext';
import { displayPhone } from '../../lib/format';
import type { RootScreenProps } from '../../navigation/types';
import { colors, fonts, radii } from '../../theme';

export function OtpScreen({ navigation }: RootScreenProps<'Otp'>) {
  const { profile, verifyOtp, requestOtp } = useApp();
  const [busy, setBusy] = useState(false);
  const [digits, setDigits] = useState(['', '', '', '']);
  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  function update(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < 3) refs[index + 1].current?.focus();
  }

  function onKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  }

  const code = digits.join('');

  return (
    <Screen padded keyboard>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Enter the code</Text>
      <Text style={styles.sub}>
        For now the code is 1234 (no SMS charge). Tap Send code only when you want to test a real
        Termii message later.
      </Text>
      <View style={styles.otpRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={refs[index]}
            value={digit}
            onChangeText={(value) => update(index, value)}
            onKeyPress={({ nativeEvent }) => onKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={1}
            style={styles.otpBox}
          />
        ))}
      </View>
      <PrimaryButton
        label={busy ? 'Verifying…' : 'Verify & continue'}
        disabled={code.length < 4 || busy}
        onPress={() => {
          void (async () => {
            setBusy(true);
            try {
              await verifyOtp(code);
              navigation.reset({ index: 0, routes: [{ name: 'Name' }] });
            } catch (err) {
              Alert.alert('Wrong code', err instanceof Error ? err.message : 'Try again.');
            } finally {
              setBusy(false);
            }
          })();
        }}
      />
      <GhostButton
        label="Send code (SMS test)"
        muted
        onPress={() => {
          void requestOtp(true)
            .then(() => Alert.alert('Code', 'If Termii is configured the SMS is on the way. Until then, 1234 still works.'))
            .catch((err) =>
              Alert.alert('Could not send', err instanceof Error ? err.message : 'Try again.'),
            );
        }}
      />
      <GhostButton
        label="Wrong number? Edit"
        muted
        onPress={() => navigation.navigate('Phone')}
        style={styles.edit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    color: colors.textMuted,
    marginBottom: 26,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  otpBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 13,
    textAlign: 'center',
    fontFamily: fonts.sansSemi,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    letterSpacing: 2,
  },
  edit: {
    marginTop: 8,
  },
});
