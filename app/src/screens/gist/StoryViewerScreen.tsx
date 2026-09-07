import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { TextField } from '../../components/ui/TextField';
import { useApp } from '../../context/AppContext';
import { pickGistImage, pickGistVideo, takePhoto, uploadMedia } from '../../lib/media';
import { api } from '../../lib/api';
import type { RootScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';

export function StoryViewerScreen({ navigation, route }: RootScreenProps<'StoryViewer'>) {
  const { stories, demoMode } = useApp();
  const story = stories.find((item) => item.id === route.params.storyId) ?? stories[0];
  const isYou = !story || story.isYou || route.params.storyId === 'you';
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<{ uri: string; kind: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isYou && story) {
    return (
      <Screen dark edges={['top', 'bottom']}>
        <Pressable style={styles.fill} onPress={() => navigation.goBack()}>
          {story.mediaUri && story.mediaKind !== 'video' ? (
            <Image source={{ uri: story.mediaUri }} style={styles.full} />
          ) : null}
          <Text style={styles.hint}>Tap to close</Text>
          <Text style={styles.name}>{story.label}</Text>
          {story.text ? <Text style={styles.copy}>{story.text}</Text> : null}
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen dark edges={['top', 'bottom']}>
      <View style={styles.compose}>
        <Text style={styles.name}>Your status</Text>
        <Text style={styles.copy}>Post a photo, video, or caption. It stays for 24 hours.</Text>
        {media ? <Image source={{ uri: media.uri }} style={styles.preview} /> : null}
        <View style={{ width: '100%', paddingHorizontal: 8 }}>
          <TextField label="" value={caption} onChangeText={setCaption} placeholder="Say something…" />
        </View>
        <View style={styles.row}>
          <Pressable
            onPress={() =>
              void pickGistImage().then((p) => p && setMedia({ uri: p.uri, kind: 'image' }))
            }
          >
            <Text style={styles.link}>Photo</Text>
          </Pressable>
          <Pressable onPress={() => void takePhoto().then((uri) => uri && setMedia({ uri, kind: 'image' }))}>
            <Text style={styles.link}>Camera</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              void pickGistVideo().then((p) => p && setMedia({ uri: p.uri, kind: 'video' }))
            }
          >
            <Text style={styles.link}>Video</Text>
          </Pressable>
        </View>
        <PrimaryButton
          label={busy ? 'Posting…' : 'Post status'}
          disabled={busy || (!caption.trim() && !media)}
          onPress={() => {
            void (async () => {
              setBusy(true);
              try {
                let url = '';
                if (media && !demoMode) url = await uploadMedia(media.uri, media.kind === 'video' ? 'video/mp4' : 'image/jpeg');
                if (!demoMode) await api.createStory(caption.trim(), url, media?.kind || '');
                navigation.goBack();
              } catch (err) {
                Alert.alert('Could not post', err instanceof Error ? err.message : 'Try again');
              } finally {
                setBusy(false);
              }
            })();
          }}
        />
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.hint}>Close</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  compose: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textOnDarkMuted,
    marginTop: 16,
  },
  name: {
    fontFamily: fonts.serifSemi,
    fontSize: 22,
    color: colors.white,
  },
  copy: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  full: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 18,
  },
  link: {
    color: colors.gold,
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    fontWeight: '600',
  },
});
