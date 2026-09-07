import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { Logo } from '../../components/ui/Logo';
import { Screen } from '../../components/ui/Screen';
import { useApp } from '../../context/AppContext';
import { getAccessToken } from '../../lib/session';
import type { RootScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';

export function SplashScreen({ navigation }: RootScreenProps<'Splash'>) {
  const { loadDemoProfile, hydrate } = useApp();
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();
    void (async () => {
      const token = await getAccessToken();
      const me = token ? await hydrate() : null;
      const wait = Math.max(0, 2000 - (Date.now() - started));
      await new Promise((resolve) => setTimeout(resolve, wait));
      if (cancelled) return;
      if (me?.name && me.campus) {
        navigation.replace('Tabs');
        return;
      }
      if (me?.name) {
        navigation.replace('Campus');
        return;
      }
      if (me || token) {
        navigation.replace(me ? 'Name' : 'Tabs');
        return;
      }
      setWelcome(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate, navigation]);

  if (!welcome) {
    return (
      <Screen dark edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Logo />
          <Text style={styles.loading}>Opening Kuvo…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen dark edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Logo />
        <Text style={styles.title}>
          A messaging app{'\n'}built for <Text style={styles.gold}>us</Text>
        </Text>
        <Text style={styles.copy}>
          Working name: Kuvo. Naira-priced, built for how we actually chat.
        </Text>
        <PrimaryButton
          label="Get started"
          onPress={() => navigation.navigate('Phone')}
          style={styles.cta}
        />
        <GhostButton
          label="Skip to app preview"
          onPress={() => {
            loadDemoProfile();
            navigation.replace('Tabs');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loading: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textOnDarkMuted,
    marginTop: 18,
  },
  title: {
    fontFamily: fonts.serifSemi,
    fontWeight: '600',
    fontSize: 30,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginTop: 22,
    marginBottom: 8,
  },
  gold: {
    color: colors.gold,
  },
  copy: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    maxWidth: 250,
    marginBottom: 40,
  },
  cta: {
    maxWidth: 220,
    alignSelf: 'center',
  },
});
