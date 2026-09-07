import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { WALLPAPER_DESIGNS, fonts, radii, spacing, useColors, wallpaperColor, wallpaperImage } from '../../theme';

type Props = {
  selected: string;
  onSelect: (id: string) => void;
};

export function WallpaperGrid({ selected, onSelect }: Props) {
  const colors = useColors();
  const image = wallpaperImage(selected);
  const color = wallpaperColor(selected) || '#FFFFFF';
  const preview = (
    <View style={styles.previewInner}>
      <View style={[styles.bubbleIn, { backgroundColor: 'rgba(255,255,255,0.92)' }]}>
        <Text style={styles.bubbleInText}>You dey campus?</Text>
      </View>
      <View style={[styles.bubbleOut, { backgroundColor: colors.green }]}>
        <Text style={styles.bubbleOutText}>Yeah — lecture hall in 5.</Text>
      </View>
      <View style={[styles.bubbleIn, { backgroundColor: 'rgba(255,255,255,0.92)' }]}>
        <Text style={styles.bubbleInText}>Send the notes later.</Text>
      </View>
    </View>
  );

  return (
    <View>
      <Text style={[styles.previewLabel, { color: colors.textMuted }]}>How it looks in a chat</Text>
      {image ? (
        <ImageBackground source={image} style={styles.preview} imageStyle={styles.previewImg}>
          {preview}
        </ImageBackground>
      ) : (
        <View style={[styles.preview, { backgroundColor: color }]}>{preview}</View>
      )}
      <View style={styles.grid}>
        {WALLPAPER_DESIGNS.map((item) => {
          const on = selected === item.id || selected === item.color;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={[
                styles.cell,
                { borderColor: on ? colors.green : colors.border, backgroundColor: colors.card },
              ]}
            >
              {item.source ? (
                <Image source={item.source} style={styles.tile} />
              ) : (
                <View style={[styles.tile, { backgroundColor: item.color || '#FFF' }]} />
              )}
              <View style={styles.meta}>
                <Text style={[styles.label, { color: colors.textDark }]} numberOfLines={1}>
                  {item.label}
                </Text>
                {on ? (
                  <Text style={[styles.using, { color: colors.green }]}>This one</Text>
                ) : (
                  <Text style={[styles.using, { color: colors.textMuted }]}>Try this</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    paddingHorizontal: spacing.xl,
    marginBottom: 8,
  },
  preview: {
    marginHorizontal: spacing.xl,
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'flex-end',
    padding: 14,
  },
  previewImg: {
    borderRadius: 18,
  },
  previewInner: {
    gap: 8,
  },
  bubbleIn: {
    alignSelf: 'flex-start',
    maxWidth: '78%',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleOut: {
    alignSelf: 'flex-end',
    maxWidth: '78%',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleInText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: '#1E1E1C',
  },
  bubbleOutText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: '#FFFFFF',
  },
  grid: {
    paddingHorizontal: spacing.xl,
    gap: 12,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderRadius: radii.md,
    overflow: 'hidden',
    minHeight: 88,
  },
  tile: {
    width: 72,
    height: 88,
  },
  meta: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    fontWeight: '600',
  },
  using: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    marginTop: 4,
  },
});
