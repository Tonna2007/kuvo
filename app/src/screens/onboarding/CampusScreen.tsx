import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackRow } from '../../components/ui/BackRow';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { SearchField } from '../../components/ui/SearchField';
import { useApp } from '../../context/AppContext';
import { rankCampuses } from '../../lib/campus';
import type { RootScreenProps } from '../../navigation/types';
import { colors, fonts, spacing, useColors } from '../../theme';

export function CampusScreen({ navigation, route }: RootScreenProps<'Campus'>) {
  const settingsMode = route.params?.mode === 'settings';
  const { profile, setCampus, campusList, demoMode, loadCampuses } = useApp();
  const colors = useColors();
  const [query, setQuery] = useState('');
  const selectedId = profile.campus?.id;

  useEffect(() => {
    if (!demoMode) void loadCampuses().catch(() => undefined);
  }, [demoMode, loadCampuses]);

  const filtered = useMemo(() => rankCampuses(campusList, query), [campusList, query]);

  return (
    <Screen keyboard>
      <View style={styles.padded}>
        <BackRow onPress={() => navigation.goBack()} />
        <Text style={[styles.title, { color: colors.textDark }]}>
          {settingsMode ? 'Change your campus' : "What's your campus?"}
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          This links you to your campus feed and cross-campus chats. Search “KAAF” if that’s yours — it
          won’t jump to University of Ghana.
        </Text>
        <SearchField value={query} onChangeText={setQuery} placeholder="Search your university" />
      </View>
      <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
        {filtered.length === 0 ? (
          <View>
            <Text style={[styles.empty, { color: colors.textMuted }]}>
              No matches — try a different search.
            </Text>
            <Pressable onPress={() => navigation.navigate('AddCampus')} style={styles.add}>
              <Text style={[styles.addLabel, { color: colors.green }]}>Can’t find yours? Add it</Text>
            </Pressable>
          </View>
        ) : (
          filtered.map((campus) => {
            const selected = campus.id === selectedId;
            return (
              <Pressable
                key={campus.id}
                onPress={() => setCampus(campus)}
                style={styles.row}
              >
                <View style={styles.icon}>
                  <Text style={styles.iconText}>{campus.initials}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, selected && styles.nameSelected]}>{campus.name}</Text>
                  <Text style={styles.city}>{campus.city}</Text>
                </View>
                <View style={[styles.check, selected && styles.checkOn]}>
                  {selected ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={settingsMode ? 'Save campus' : 'Continue'}
          disabled={!profile.campus}
          onPress={() =>
            settingsMode
              ? navigation.navigate('Verify', { mode: 'settings' })
              : navigation.navigate('Verify')
          }
        />
        <GhostButton
          label="Can't find yours? Add it"
          muted
          onPress={() => navigation.navigate('AddCampus')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: spacing.xxl,
  },
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
    marginBottom: 16,
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  empty: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.green,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.sansSemi,
    fontSize: 13.5,
    color: colors.textDark,
    fontWeight: '600',
  },
  nameSelected: {
    color: colors.green,
  },
  city: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  checkMark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: 14,
    paddingBottom: 20,
  },
  add: {
    paddingVertical: 12,
  },
  addLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 13.5,
    fontWeight: '600',
  },
});
