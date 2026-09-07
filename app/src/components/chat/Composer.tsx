import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Mic, Paperclip, Send } from 'lucide-react-native';
import { fonts, radii, useColors } from '../../theme';

type Props = {
  onSend: (text: string) => void;
  onAttach: () => void;
  onVoice?: (duration: string) => void;
  bottomInset?: number;
};

export function Composer({ onSend, onAttach, onVoice, bottomInset = 16 }: Props) {
  const colors = useColors();
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const sending = useRef(false);

  function submit() {
    if (sending.current) return;
    const next = text.trim();
    if (!next) return;
    sending.current = true;
    onSend(next);
    setText('');
    setTimeout(() => {
      sending.current = false;
    }, 500);
  }

  function toggleVoice() {
    if (!onVoice) return;
    if (!recording) {
      setRecording(true);
      setStartedAt(Date.now());
      return;
    }
    const secs = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const duration = `0:${String(secs).padStart(2, '0')}`;
    setRecording(false);
    onVoice(duration);
  }

  return (
    <View
      style={[
        styles.bar,
        {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          paddingBottom: Math.max(bottomInset, 8),
        },
      ]}
    >
      <Pressable onPress={onAttach} hitSlop={8}>
        <Paperclip size={18} color={colors.textMuted} strokeWidth={2} />
      </Pressable>
      <Pressable onPress={toggleVoice} hitSlop={8}>
        <Mic size={18} color={recording ? colors.danger : colors.textMuted} strokeWidth={2} />
      </Pressable>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={recording ? 'Recording… tap mic to send' : 'Message'}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.box,
          {
            backgroundColor: colors.composer,
            borderColor: colors.border,
            color: colors.textDark,
          },
        ]}
        onSubmitEditing={submit}
        blurOnSubmit
        returnKeyType="send"
      />
      <Pressable
        onPress={submit}
        style={({ pressed }) => [styles.send, { backgroundColor: colors.green }, pressed && { opacity: 0.85 }]}
      >
        <Send size={16} color={colors.white} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E4E4DE',
    backgroundColor: '#FFFFFF',
  },
  box: {
    flex: 1,
    backgroundColor: '#F5F5F2',
    borderWidth: 1,
    borderColor: '#E4E4DE',
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: '#1E1E1C',
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#145C38',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
