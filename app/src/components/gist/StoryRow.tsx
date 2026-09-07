import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';
import type { Story } from '../../types';
import { Avatar } from '../ui/Avatar';

type Props = {
  stories: Story[];
  onPress: (storyId: string) => void;
};

export function StoryRow({ stories, onPress }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {stories.map((story) => (
        <Pressable key={story.id} onPress={() => onPress(story.id)} style={styles.story}>
          {story.isYou ? (
            <View style={[styles.ring, styles.youRing]}>
              <Text style={styles.plus}>+</Text>
            </View>
          ) : (
            <View style={styles.ring}>
              <Avatar initials={story.initials} tone={story.tone} size={48} />
            </View>
          )}
          <Text style={styles.label} numberOfLines={1}>
            {story.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
  },
  story: {
    alignItems: 'center',
    width: 56,
  },
  ring: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youRing: {
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  plus: {
    fontFamily: fonts.sans,
    fontSize: 22,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 5,
    maxWidth: 56,
    textAlign: 'center',
  },
});
