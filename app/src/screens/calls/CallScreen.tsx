import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PhoneOff } from 'lucide-react-native';
import { Avatar } from '../../components/ui/Avatar';
import { Screen } from '../../components/ui/Screen';
import { useApp } from '../../context/AppContext';
import { initialsFromName } from '../../lib/format';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, useColors } from '../../theme';

export function CallScreen({ navigation, route }: RootScreenProps<'Call'>) {
  const { username, name, direction } = route.params;
  const { ringUser, hangupCall } = useApp();
  const colors = useColors();
  const [status, setStatus] = useState(direction === 'in' ? 'Incoming…' : 'Ringing…');

  useEffect(() => {
    if (direction === 'out') {
      void ringUser(username, name);
    }
    const t = setTimeout(() => setStatus('Connected'), 2500);
    return () => {
      clearTimeout(t);
      hangupCall(username);
    };
  }, [direction, hangupCall, name, ringUser, username]);

  return (
    <Screen dark edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Avatar initials={initialsFromName(name)} size={88} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.hint}>
          Both people need Kuvo open. Live voice/video on the carrier sits on the public API next.
        </Text>
        <Pressable
          onPress={() => {
            hangupCall(username);
            navigation.goBack();
          }}
          style={[styles.end, { backgroundColor: colors.danger }]}
        >
          <PhoneOff size={22} color={colors.white} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.endLabel}>End</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  name: {
    fontFamily: fonts.serifSemi,
    fontSize: 26,
    color: '#fff',
    marginTop: 18,
  },
  status: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: '#BFD3C6',
    marginTop: 6,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 19,
    color: '#BFD3C6',
    textAlign: 'center',
    marginTop: 16,
  },
  end: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
  },
  endLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: '#BFD3C6',
    marginTop: 8,
  },
});
