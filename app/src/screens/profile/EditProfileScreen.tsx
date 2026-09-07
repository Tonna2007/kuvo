import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { Avatar } from '../../components/ui/Avatar';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { TextField } from '../../components/ui/TextField';
import { useApp } from '../../context/AppContext';
import { initialsFromName } from '../../lib/format';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, useColors } from '../../theme';

export function EditProfileScreen({ navigation }: RootScreenProps<'EditProfile'>) {
  const { profile, patchProfile, openSheet } = useApp();
  const colors = useColors();
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [about, setAbout] = useState(profile.about);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.schoolEmail);

  return (
    <Screen keyboard>
      <SubscreenHeader title="Edit profile" onBack={() => navigation.goBack()} />
      <Pressable style={styles.avatarWrap} onPress={() => openSheet('photo-picker')}>
        <Avatar
          initials={initialsFromName(name || profile.name || 'EM')}
          size={88}
          uri={profile.avatarUri}
          badge={profile.campus?.initials}
          verified={profile.verified}
        />
        <View style={[styles.cam, { backgroundColor: colors.gold, borderColor: colors.surface }]}>
          <Camera size={15} color={colors.greenDarker} strokeWidth={2.5} />
        </View>
      </Pressable>
      <View style={styles.form}>
        <TextField label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
        <TextField
          label="Username"
          value={username}
          onChangeText={(value) => setUsername(value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
          placeholder="yourname"
          autoCapitalize="none"
        />
        <TextField
          label="About"
          value={about}
          onChangeText={setAbout}
          placeholder="PharmD student, KAAF University College"
        />
        <TextField
          label="Phone number"
          value={phone}
          onChangeText={(value) => setPhone(value.replace(/\D/g, '').slice(0, 10))}
          placeholder="8012345678"
          keyboardType="phone-pad"
        />
        <TextField
          label="School email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@kaaf.edu.gh"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label="Campus"
          value={profile.campus?.name ?? ''}
          onChangeText={() => undefined}
          editable={false}
        />
        <Text
          style={{ fontFamily: fonts.sansSemi, fontSize: 13, color: colors.green, marginBottom: 16 }}
          onPress={() => navigation.navigate('Campus', { mode: 'settings' })}
        >
          Change campus / verify
        </Text>
        <PrimaryButton
          label="Save"
          onPress={() => {
            patchProfile({
              name: name.trim(),
              username: username.trim(),
              about: about.trim(),
              phone: phone.trim(),
              schoolEmail: email.trim(),
              verified: email.trim() ? profile.verified : false,
            });
            navigation.goBack();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    width: 88,
    height: 88,
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  cam: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: 28,
  },
});
