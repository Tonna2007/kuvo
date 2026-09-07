import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Camera, Image as ImageIcon, Mic, Video as VideoIcon, X } from 'lucide-react-native';
import { FeedPost } from '../../components/gist/FeedPost';
import { StoryRow } from '../../components/gist/StoryRow';
import { AppHeader, HeaderIconButton } from '../../components/ui/AppHeader';
import { Avatar } from '../../components/ui/Avatar';
import { Screen } from '../../components/ui/Screen';
import { useApp } from '../../context/AppContext';
import { t } from '../../i18n';
import { initialsFromName } from '../../lib/format';
import { pickGistImage, pickGistVideo, takePhoto, type MediaKind, type PickedMedia } from '../../lib/media';
import type { TabScreenProps } from '../../navigation/types';
import { fonts, radii, spacing, useColors } from '../../theme';

export function GistScreen({ navigation }: TabScreenProps<'GistTab'>) {
  const { stories, posts, postGist, profile, language } = useApp();
  void language;
  const colors = useColors();
  const [draft, setDraft] = useState('');
  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [startedAt, setStartedAt] = useState(0);

  async function attach(from: 'gallery' | 'camera' | 'video') {
    const picked =
      from === 'camera'
        ? await takePhoto().then((uri) => (uri ? { uri, mime: 'image/jpeg', kind: 'image' as const } : null))
        : from === 'video'
          ? await pickGistVideo()
          : await pickGistImage();
    if (picked) setMedia(picked);
  }

  function toggleVoice() {
    if (!recording) {
      setRecording(true);
      setStartedAt(Date.now());
      return;
    }
    const secs = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    setRecording(false);
    void postGist(`Voice note 0:${String(secs).padStart(2, '0')}`, undefined, 'voice');
  }


  const campus = profile.campus;

  return (
    <Screen>
      <AppHeader
        title="Gist"
        right={
          <HeaderIconButton onPress={() => setMenuOpen((open) => !open)}>
            <Avatar
              initials={initialsFromName(profile.name || 'You')}
              size={28}
              uri={profile.avatarUri}
              badge={profile.campus?.initials}
              verified={profile.verified}
            />
          </HeaderIconButton>
        }
      />
      {menuOpen ? (
        <View style={[styles.fly, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            style={styles.flyItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Profile');
            }}
          >
            <Text style={[styles.flyLabel, { color: colors.textDark }]}>Settings</Text>
          </Pressable>
        </View>
      ) : null}
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={[styles.campusCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.campusKicker, { color: colors.green }]}>CAMPUS FEED</Text>
          <Text style={[styles.campusName, { color: colors.textDark }]}>
            {campus
              ? t('gist.youAreIn', { campus: campus.name })
              : t('gist.noCampus')}
          </Text>
          {campus ? (
            <Text style={[styles.campusCity, { color: colors.textMuted }]}>
              {campus.city}
              {profile.verified ? ' · verified' : ' · unverified'}
            </Text>
          ) : null}
        </View>
        <StoryRow
          stories={stories}
          onPress={(storyId) => navigation.navigate('StoryViewer', { storyId })}
        />
        <View style={[styles.composer, { borderColor: colors.border }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('gist.composer')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.textDark }]}
            multiline
          />
          {media ? (
            <View style={styles.previewWrap}>
              {media.kind === 'image' ? (
                <Image source={{ uri: media.uri }} style={styles.preview} />
              ) : (
                <Text style={[styles.mediaTag, { color: colors.textDark }]}>
                  {media.kind === 'video' ? 'Video attached' : 'Voice note attached'}
                </Text>
              )}
              <Pressable onPress={() => setMedia(null)} style={styles.clearPhoto}>
                <X size={14} color={colors.white} strokeWidth={2.4} />
              </Pressable>
            </View>
          ) : null}
          <View style={styles.actions}>
            <View style={styles.mediaRow}>
              <Pressable onPress={() => void attach('gallery')} style={styles.iconBtn}>
                <ImageIcon size={18} color={colors.green} strokeWidth={2} />
              </Pressable>
              <Pressable onPress={() => void attach('camera')} style={styles.iconBtn}>
                <Camera size={18} color={colors.green} strokeWidth={2} />
              </Pressable>
              <Pressable onPress={() => void attach('video')} style={styles.iconBtn}>
                <VideoIcon size={18} color={colors.green} strokeWidth={2} />
              </Pressable>
              <Pressable onPress={toggleVoice} style={styles.iconBtn}>
                <Mic size={18} color={recording ? colors.danger : colors.green} strokeWidth={2} />
              </Pressable>
            </View>
            <Pressable
              disabled={(!draft.trim() && !media) || busy}
              onPress={() => {
                const text = draft;
                const file = media;
                setDraft('');
                setMedia(null);
                setBusy(true);
                void postGist(text, file?.uri, file?.kind as MediaKind | undefined).finally(() =>
                  setBusy(false),
                );
              }}
              style={[
                styles.postBtn,
                { backgroundColor: colors.gold },
                (!draft.trim() && !media) || busy ? styles.postBtnOff : null,
              ]}
            >
              <Text style={[styles.postLabel, { color: colors.greenDarker }]}>
                {busy ? 'Posting' : 'Post'}
              </Text>
            </Pressable>
          </View>
        </View>
        {posts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
        {posts.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>{t('gist.empty')}</Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  campusCard: {
    marginHorizontal: spacing.xl,
    marginBottom: 12,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  campusKicker: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  campusName: {
    fontFamily: fonts.serifSemi,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  campusCity: {
    fontFamily: fonts.sans,
    fontSize: 12,
    marginTop: 2,
  },
  composer: {
    marginHorizontal: spacing.xl,
    marginBottom: 12,
    borderWidth: 1.5,
    borderRadius: radii.md,
    padding: 10,
  },
  input: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  previewWrap: {
    marginTop: 8,
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: radii.md,
  },
  mediaTag: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    paddingVertical: 8,
  },
  clearPhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    padding: 8,
  },
  postBtn: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  postBtnOff: {
    opacity: 0.45,
  },
  postLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 12.5,
    fontWeight: '600',
  },
  empty: {
    fontFamily: fonts.sans,
    fontSize: 13,
    paddingHorizontal: spacing.xl,
    paddingVertical: 16,
  },
  fly: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 100,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  flyItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4DE',
  },
  flyLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: '500',
  },
});
