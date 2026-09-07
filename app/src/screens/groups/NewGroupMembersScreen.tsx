import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../components/ui/Avatar';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { SearchField } from '../../components/ui/SearchField';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { useApp } from '../../context/AppContext';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, spacing, useColors } from '../../theme';

export function NewGroupMembersScreen({ navigation }: RootScreenProps<'NewGroupMembers'>) {
  const { chats } = useApp();
  const colors = useColors();
  const contacts = useMemo(
    () =>
      chats
        .filter((chat) => chat.kind === 'direct')
        .map((chat) => ({
          id: chat.id,
          name: chat.name.split(' (')[0],
          campus: chat.name.includes('(') ? chat.name.replace(/^.*\((.*)\)$/, '$1') : 'Campus',
          initials: chat.initials,
          tone: chat.tone,
        })),
    [chats],
  );
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>(contacts.slice(0, 3).map((item) => item.id));

  const visible = contacts.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Screen>
      <SubscreenHeader title="Add members" onBack={() => navigation.goBack()} />
      <View style={styles.search}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Search contacts" />
      </View>
      <Text style={[styles.count, { color: colors.textMuted }]}>{picked.length} selected</Text>
      <ScrollView>
        {visible.map((item) => {
          const on = picked.includes(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() =>
                setPicked((prev) =>
                  on ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                )
              }
              style={[styles.row, { borderBottomColor: colors.border }]}
            >
              <Avatar initials={item.initials} tone={item.tone} size={38} />
              <View style={styles.meta}>
                <Text style={[styles.name, { color: colors.textDark }]}>{item.name}</Text>
                <Text style={[styles.campus, { color: colors.textMuted }]}>{item.campus}</Text>
              </View>
              <View
                style={[
                  styles.check,
                  { borderColor: on ? colors.green : colors.border, backgroundColor: on ? colors.green : 'transparent' },
                ]}
              >
                {on ? <Text style={styles.mark}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="Next"
          disabled={picked.length === 0}
          onPress={() =>
            navigation.navigate('NewGroupDetails', {
              memberNames: contacts.filter((item) => picked.includes(item.id)).map((item) => item.name),
            })
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    paddingHorizontal: spacing.xl,
  },
  count: {
    fontFamily: fonts.sans,
    fontSize: 12,
    paddingHorizontal: spacing.xl,
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.xl,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  meta: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.sansSemi,
    fontSize: 13.5,
    fontWeight: '600',
  },
  campus: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    marginTop: 1,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    paddingBottom: 20,
  },
});
