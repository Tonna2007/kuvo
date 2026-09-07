import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Globe,
  Lock,
  Palette,
  Image as ImageIcon,
  UserPlus,
  UserRound,
  Zap,
} from 'lucide-react-native';
import { AppHeader } from '../../components/ui/AppHeader';
import { Avatar } from '../../components/ui/Avatar';
import { Screen } from '../../components/ui/Screen';
import { useApp } from '../../context/AppContext';
import { settings } from '../../data/settings';
import { t } from '../../i18n';
import { initialsFromName } from '../../lib/format';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, spacing, useColors } from '../../theme';
import type { SettingIcon } from '../../types';

const icons: Record<SettingIcon, typeof UserRound> = {
  account: UserRound,
  privacy: Lock,
  data: Zap,
  notifications: Bell,
  appearance: Palette,
  wallpaper: ImageIcon,
  language: Globe,
  help: CircleHelp,
  invite: UserPlus,
};

export function ProfileScreen({ navigation }: RootScreenProps<'Profile'>) {
  const { profile, language } = useApp();
  void language;
  const colors = useColors();
  const name = profile.name || 'Your name';
  const campus = profile.campus?.name ?? 'No campus yet';

  return (
    <Screen>
      <AppHeader title="Settings" titleSize={22} />
      <Pressable
        style={[styles.profile, { borderBottomColor: colors.border }]}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Avatar
          initials={initialsFromName(name)}
          size={48}
          uri={profile.avatarUri}
          badge={profile.campus?.initials}
          verified={profile.verified}
        />
        <View>
          <Text style={[styles.pname, { color: colors.textDark }]}>{name}</Text>
          <Text style={[styles.puni, { color: colors.textMuted }]}>
            {profile.username ? `@${profile.username} · ` : ''}
            {campus}
            {profile.verified ? ' · verified' : ''}
          </Text>
          <Text style={[styles.puni, { color: colors.green }]}>{t('profile.tapName')}</Text>
        </View>
      </Pressable>
      <ScrollView>
        {settings.map((item) => {
          const Icon = icons[item.icon];
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                if (item.id === 'invite') {
                  void Share.share({
                    message: `Join me on Kuvo${profile.username ? ` — I'm @${profile.username}` : ''}.`,
                  });
                  return;
                }
                switch (item.id) {
                  case 'account':
                    navigation.navigate('Account');
                    break;
                  case 'privacy':
                    navigation.navigate('Privacy');
                    break;
                  case 'notifications':
                    navigation.navigate('Notifications');
                    break;
                  case 'appearance':
                    navigation.navigate('Appearance');
                    break;
                  case 'language':
                    navigation.navigate('Language');
                    break;
                  case 'help':
                    navigation.navigate('Help');
                    break;
                }
              }}
              style={({ pressed }) => [
                styles.row,
                { borderBottomColor: colors.border },
                pressed && { backgroundColor: colors.card },
              ]}
            >
              <View style={[styles.ic, { backgroundColor: colors.card }]}>
                <Icon size={17} color={colors.green} strokeWidth={2} />
              </View>
              <Text style={[styles.label, { color: colors.textDark }]}>
                {t(`settings.${item.id}`) === `settings.${item.id}` ? item.label : t(`settings.${item.id}`)}
              </Text>
              <ChevronRight size={15} color={colors.textMuted} strokeWidth={2} />
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.xl,
    paddingTop: 10,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4DE',
    marginBottom: 6,
  },
  pname: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: '#1E1E1C',
    fontWeight: '600',
  },
  puni: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: '#5B5D57',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4DE',
  },
  pressed: {
    backgroundColor: '#F1F5F1',
  },
  ic: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: '#1E1E1C',
  },
});
