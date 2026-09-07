import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { WallpaperGrid } from '../../components/ui/WallpaperGrid';
import { useApp } from '../../context/AppContext';
import { pickGistImage } from '../../lib/media';
import type { RootScreenProps } from '../../navigation/types';
import { BRAND_SWATCHES, fonts, spacing, useColors, type ThemeMode } from '../../theme';

const MODES: ThemeMode[] = ['light', 'dark', 'system'];
const SWATCH_NAMES = ['Campus green', 'Lake blue', 'Clay red', 'Royal purple', 'Teal', 'Hibiscus'];

export function AppearanceScreen({ navigation }: RootScreenProps<'Appearance'>) {
  const { profile, patchProfile, appWallpaper, setAppWallpaper } = useApp();
  const colors = useColors();

  return (
    <Screen>
      <SubscreenHeader title="Appearance" onBack={() => navigation.goBack()} />
      <ScrollView>
        <Text style={[styles.intro, { color: colors.textDark }]}>Make Kuvo feel like yours.</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Light or dark, a colour you like, then a chat background.
        </Text>
        <Text style={[styles.heading, { color: colors.textMuted }]}>Light or dark</Text>
        <View style={styles.modes}>
          {MODES.map((mode) => {
            const selected = profile.themeMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => patchProfile({ themeMode: mode })}
                style={[
                  styles.mode,
                  {
                    borderColor: selected ? colors.green : colors.border,
                    backgroundColor: selected ? colors.green : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.modeLabel, { color: selected ? colors.white : colors.textMuted }]}>
                  {mode[0].toUpperCase() + mode.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.heading, { color: colors.textMuted }]}>Colour</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          This is the green (or blue, or clay) on buttons and tabs.
        </Text>
        <View style={styles.swatches}>
          {BRAND_SWATCHES.map((swatch, index) => {
            const selected = profile.themeColor === swatch.hex;
            return (
              <Pressable
                key={swatch.hex}
                onPress={() => patchProfile({ themeColor: swatch.hex })}
                style={[
                  styles.swatchCard,
                  {
                    borderColor: selected ? colors.green : colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              >
                <View style={[styles.swatchBar, { backgroundColor: swatch.hex }]} />
                <Text style={[styles.swatchName, { color: colors.textDark }]}>{SWATCH_NAMES[index]}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.heading, { color: colors.textMuted }]}>Chat background</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Pick one you like. You can also use a photo from your gallery.
        </Text>
        <WallpaperGrid selected={appWallpaper} onSelect={setAppWallpaper} />
        <Pressable
          style={[styles.imageButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => void pickGistImage().then((picked) => picked && setAppWallpaper(picked.uri))}
        >
          <Text style={[styles.imageButtonText, { color: colors.green }]}>Use a photo from my gallery</Text>
        </Pressable>
        <View style={styles.footer}>
          <PrimaryButton label="Looks good" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontFamily: fonts.serifSemi,
    fontSize: 22,
    fontWeight: '600',
    paddingHorizontal: spacing.xl,
    paddingTop: 8,
  },
  heading: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    paddingHorizontal: spacing.xl,
    paddingTop: 18,
    paddingBottom: 6,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    paddingHorizontal: spacing.xl,
    paddingBottom: 12,
  },
  modes: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.xl,
    paddingBottom: 8,
  },
  mode: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  modeLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    fontWeight: '600',
  },
  swatches: {
    paddingHorizontal: spacing.xl,
    gap: 10,
    paddingBottom: 8,
  },
  swatchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  swatchBar: {
    width: 72,
    height: 56,
  },
  swatchName: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    fontWeight: '600',
  },
  imageButton: {
    marginHorizontal: spacing.xl,
    marginTop: 16,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  imageButtonText: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 20,
  },
});
