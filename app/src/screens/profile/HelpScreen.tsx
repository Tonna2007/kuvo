import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { useApp } from '../../context/AppContext';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, radii, spacing, useColors } from '../../theme';

const faqs = [
  {
    q: 'How do I start a chat?',
    a: 'On Chats, tap the gold + then Chat. Enter their Kuvo username. Tap You on that same + to message yourself (notes).',
  },
  {
    q: 'How do I call someone?',
    a: 'Tap + then Call, or open the Calls tab. Both of you need Kuvo open on the same network/API. This build rings and connects the call screen; carrier-grade voice comes with the public server.',
  },
  {
    q: 'Where is Settings / my profile?',
    a: 'Tap your avatar at the top right of Chats. That used to be the three-dot menu.',
  },
  {
    q: 'Why is the campus feed empty?',
    a: 'It only shows posts from people on Kuvo. You’re looking at your campus — share a gist to start it.',
  },
  {
    q: 'Did my wallpaper save to the server?',
    a: 'No. App wallpaper and per-chat wallpaper stay on this phone only.',
  },
  {
    q: 'How do I add a language?',
    a: 'Settings → App language. English and Naija Pidgin ship in the app. Another language is a JSON file next to en.json — no recoding screens.',
  },
];

export function HelpScreen({ navigation }: RootScreenProps<'Help'>) {
  const colors = useColors();
  const { profile } = useApp();

  return (
    <Screen>
      <SubscreenHeader title="Help" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.lead, { color: colors.textMuted }]}>
          Kuvo is a campus messenger. You’re {profile.name || 'signed in'}
          {profile.campus ? ` at ${profile.campus.name}` : ''}.
        </Text>
        {faqs.map((item) => (
          <View key={item.q} style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.q, { color: colors.textDark }]}>{item.q}</Text>
            <Text style={[styles.a, { color: colors.textMuted }]}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 28,
  },
  lead: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 21,
    marginBottom: 16,
  },
  card: {
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 10,
  },
  q: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  a: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
