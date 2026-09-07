import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { FileText, Mic, X } from 'lucide-react-native';
import { colors, fonts, radii, useColors } from '../../theme';
import { openMedia } from '../../lib/media';
import type { Message } from '../../types';

type Props = {
  message: Message;
  isGroup: boolean;
  lowDataMode: boolean;
};

export function MessageBubble({ message, isGroup, lowDataMode }: Props) {
  const theme = useColors();
  const mine = message.fromMe;
  const [full, setFull] = useState(false);
  const photo = message.kind === 'image' ? message.imageUri : undefined;

  return (
    <View style={[styles.wrap, mine ? styles.mine : styles.theirs]}>
      {isGroup && !mine && message.senderName ? (
        <Text style={[styles.sender, { color: message.senderColor ?? theme.goldDark }]}>
          {message.senderName}
        </Text>
      ) : null}
      {message.kind === 'video' ? (
        <Pressable
          style={[styles.attach, mine && styles.attachMine]}
          onPress={() => message.imageUri && openMedia(message.imageUri)}
        >
          <View style={styles.frame}>
            <Text style={styles.lowDataText}>Tap to play video</Text>
          </View>
          {message.caption ? <Text style={styles.caption}>{message.caption}</Text> : null}
        </Pressable>
      ) : message.kind === 'image' ? (
        <Pressable
          style={[styles.attach, mine && styles.attachMine]}
          onPress={() => photo && setFull(true)}
        >
          {lowDataMode ? (
            <View style={styles.lowData}>
              <Text style={styles.lowDataText}>Photo hidden · Low data mode</Text>
            </View>
          ) : (
            <View style={styles.frame}>
              <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
            </View>
          )}
          {message.caption ? <Text style={styles.caption}>{message.caption}</Text> : null}
        </Pressable>
      ) : message.kind === 'document' ? (
        <View style={[styles.doc, mine && styles.docMine]}>
          <View style={styles.docIcon}>
            <FileText size={18} color="#8A5A16" strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.docName}>{message.docName}</Text>
            <Text style={styles.docSize}>{message.docSize}</Text>
          </View>
        </View>
      ) : message.kind === 'voice' ? (
        <Pressable
          onPress={() => message.imageUri && openMedia(message.imageUri)}
          style={[
            styles.bubble,
            mine ? [styles.out, { backgroundColor: theme.green }] : [styles.in, { backgroundColor: theme.bubble }],
            styles.voice,
          ]}
        >
          <Mic size={14} color={mine ? theme.white : theme.textDark} strokeWidth={2} />
          <Text style={[styles.body, { color: mine ? theme.white : theme.textDark }]}>
            {message.imageUri ? `▶ ${message.voiceDuration || 'voice'}` : `${message.voiceDuration || 'Voice'} note`}
          </Text>
        </Pressable>
      ) : (
        <View
          style={[
            styles.bubble,
            mine ? [styles.out, { backgroundColor: theme.green }] : [styles.in, { backgroundColor: theme.bubble }],
          ]}
        >
          <Text style={[styles.body, { color: mine ? theme.white : theme.textDark }]}>{message.text}</Text>
        </View>
      )}
      {mine ? (
        <View style={[styles.seed, { borderColor: message.seen ? theme.gold : theme.border, backgroundColor: message.seen ? theme.gold : 'transparent' }]} />
      ) : null}
      <Modal visible={full} transparent animationType="fade" onRequestClose={() => setFull(false)}>
        <View style={styles.fullWrap}>
          <Pressable onPress={() => setFull(false)} style={styles.fullClose} hitSlop={12}>
            <X size={22} color="#fff" strokeWidth={2.2} />
          </Pressable>
          <Image source={{ uri: photo }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    maxWidth: '78%',
    marginBottom: 9,
  },
  mine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  sender: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
    marginLeft: 2,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.xl,
  },
  in: {
    backgroundColor: colors.bubble,
    borderBottomLeftRadius: 5,
  },
  out: {
    backgroundColor: colors.green,
    borderBottomRightRadius: 5,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 19.5,
  },
  voice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attach: {
    backgroundColor: colors.bubble,
    borderRadius: 16,
    overflow: 'hidden',
    width: 240,
  },
  attachMine: {
    backgroundColor: colors.bubble,
  },
  frame: {
    width: 240,
    height: 180,
    overflow: 'hidden',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  photo: {
    width: 240,
    height: 240,
  },
  lowData: {
    width: 240,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  lowDataText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  caption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: colors.textDark,
  },
  doc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bubble,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: 230,
  },
  docMine: {
    backgroundColor: colors.bubble,
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontFamily: fonts.sansSemi,
    fontSize: 12.5,
    color: colors.textDark,
    fontWeight: '600',
  },
  docSize: {
    fontFamily: fonts.sans,
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  fullWrap: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  fullClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  seed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    marginTop: 4,
    marginRight: 4,
  },
});
