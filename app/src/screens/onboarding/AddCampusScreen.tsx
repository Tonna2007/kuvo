import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { TextField } from '../../components/ui/TextField';
import { useApp } from '../../context/AppContext';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, radii, useColors } from '../../theme';

export function AddCampusScreen({ navigation }: RootScreenProps<'AddCampus'>) {
  const { addCampus } = useApp();
  const colors = useColors();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState<'GH' | 'NG'>('NG');

  return (
    <Screen keyboard padded>
      <SubscreenHeader title="Add your campus" onBack={() => navigation.goBack()} />
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        If your university is not in the list, add it. We’ll keep it on your profile while it waits for review.
      </Text>
      <TextField label="University name" value={name} onChangeText={setName} placeholder="e.g. KAAF University College" />
      <TextField label="City" value={city} onChangeText={setCity} placeholder="e.g. Buduburam" />
      <Text style={[styles.label, { color: colors.textMuted }]}>Country</Text>
      <View style={styles.row}>
        {(['NG', 'GH'] as const).map((code) => {
          const on = country === code;
          return (
            <Pressable
              key={code}
              onPress={() => setCountry(code)}
              style={[
                styles.opt,
                {
                  borderColor: on ? colors.green : colors.border,
                  backgroundColor: on ? colors.green : 'transparent',
                },
              ]}
            >
              <Text style={[styles.optLabel, { color: on ? colors.white : colors.textMuted }]}>
                {code === 'NG' ? 'Nigeria' : 'Ghana'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <PrimaryButton
        label="Add campus"
        disabled={name.trim().length < 3 || city.trim().length < 2}
        onPress={() => {
          addCampus({ name, city, country });
          navigation.navigate('Verify');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 21,
    marginBottom: 20,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 12,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  opt: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1.5,
  },
  optLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    fontWeight: '600',
  },
});
