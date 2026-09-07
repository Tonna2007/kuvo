import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { WallpaperGrid } from '../../components/ui/WallpaperGrid';
import { useApp } from '../../context/AppContext';
import { pickGistImage } from '../../lib/media';
import type { RootScreenProps } from '../../navigation/types';
import { spacing, useColors } from '../../theme';

export function WallpaperScreen({ navigation, route }: RootScreenProps<'Wallpaper'>) {
  const chatId = route.params?.chatId;
  const { appWallpaper, chatWallpapers, setAppWallpaper, setChatWallpaper } = useApp();
  const colors = useColors();
  const [selected, setSelected] = useState(chatId ? chatWallpapers[chatId] || appWallpaper : appWallpaper);

  return (
    <Screen>
      <SubscreenHeader
        title={chatId ? 'This chat wallpaper' : 'Chat wallpaper'}
        onBack={() => navigation.goBack()}
      />
      <WallpaperGrid selected={selected} onSelect={setSelected} />
      <Pressable
        style={[styles.imageButton, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={() => void pickGistImage().then((picked) => picked && setSelected(picked.uri))}
      >
        <Text style={[styles.imageButtonText, { color: colors.green }]}>Choose a photo from gallery</Text>
      </Pressable>
      <View style={styles.footer}>
        <PrimaryButton
          label="Set wallpaper"
          onPress={() => {
            if (chatId) setChatWallpaper(chatId, selected);
            else setAppWallpaper(selected);
            navigation.goBack();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: 20,
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
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
