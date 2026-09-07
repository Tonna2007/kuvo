import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, radii, spacing, useColors } from '../../theme';
import type { FeedPost as FeedPostType } from '../../types';
import { openMedia } from '../../lib/media';
import { Avatar } from '../ui/Avatar';

type Props = {
  post: FeedPostType;
};

export function FeedPost({ post }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Avatar initials={post.initials} tone={post.tone} size={36} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.textDark }]}>
          {post.name}
          <Text style={[styles.time, { color: colors.textMuted }]}> · {post.time}</Text>
        </Text>
        {post.text ? <Text style={[styles.text, { color: colors.textMuted }]}>{post.text}</Text> : null}
        {post.imageUri && post.mediaKind === 'video' ? (
          <Pressable style={styles.image} onPress={() => openMedia(post.imageUri!)}>
            <Text style={[styles.playLabel, { color: colors.green }]}>Tap to play video</Text>
          </Pressable>
        ) : null}
        {post.imageUri && post.mediaKind === 'voice' ? (
          <Pressable style={[styles.voice, { backgroundColor: colors.card }]} onPress={() => openMedia(post.imageUri!)}>
            <Text style={[styles.playLabel, { color: colors.green }]}>Tap to play voice note</Text>
          </Pressable>
        ) : null}
        {post.imageUri && post.mediaKind !== 'video' && post.mediaKind !== 'voice' ? (
          <Image source={{ uri: post.imageUri }} style={styles.image} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  body: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    fontWeight: '600',
  },
  time: {
    fontFamily: fonts.sans,
    fontSize: 10.5,
    fontWeight: '400',
  },
  text: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    marginTop: 2,
  },
  image: {
    marginTop: 8,
    width: '100%',
    height: 180,
    borderRadius: radii.md,
    backgroundColor: '#E4E4DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voice: {
    marginTop: 8,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  playLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    fontWeight: '600',
  },
});
