import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { TextField } from '../../components/ui/TextField';
import { useApp } from '../../context/AppContext';
import type { RootScreenProps } from '../../navigation/types';
import { useColors } from '../../theme';
import { pickPhoto } from '../../lib/media';

export function NewGroupDetailsScreen({ navigation, route }: RootScreenProps<'NewGroupDetails'>) {
  const { memberNames } = route.params;
  const { createGroup } = useApp();
  const colors = useColors();
  const [name, setName] = useState('Cross-Campus Devs');
  const [busy, setBusy] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  return (
    <Screen keyboard>
      <SubscreenHeader title="Name this group" onBack={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: 28 }}>
      <Pressable style={styles.iconWrap} onPress={() => void pickPhoto().then((picked) => setAvatarUri(picked?.uri ?? null))}>
        {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.circle} /> : <View style={[styles.circle, { backgroundColor: colors.card }]}><Camera size={26} color={colors.textMuted} strokeWidth={2} /></View>}
        <View style={[styles.cam, { backgroundColor: colors.gold, borderColor: colors.surface }]}>
          <Camera size={13} color={colors.greenDarker} strokeWidth={2.5} />
        </View>
      </Pressable>
      <TextField label="Group name" value={name} onChangeText={setName} placeholder="e.g. Cross-Campus Devs" />
      <PrimaryButton
        label={busy ? 'Creating…' : 'Create group'}
        disabled={name.trim().length < 2 || busy}
        onPress={() => {
          void (async () => {
            setBusy(true);
            try {
              const chat = await createGroup({ name: name.trim(), memberNames, avatarUri });
              navigation.reset({
                index: 1,
                routes: [{ name: 'Tabs' }, { name: 'Conversation', params: { chatId: chat.id } }],
              });
            } catch (err) {
              Alert.alert('Could not create group', err instanceof Error ? err.message : 'Try again.');
              setBusy(false);
            }
          })();
        }}
      />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 74,
    height: 74,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 22,
  },
  circle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cam: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
