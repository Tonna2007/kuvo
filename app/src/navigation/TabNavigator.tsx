import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CircleDashed, MessageCircle, Phone, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CallsScreen } from '../screens/calls/CallsScreen';
import { ChatsScreen } from '../screens/chats/ChatsScreen';
import { GistScreen } from '../screens/gist/GistScreen';
import { GroupsScreen } from '../screens/groups/GroupsScreen';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { fonts, useColors } from '../theme';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { language } = useApp();
  void language;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.sansSemi,
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 52 + Math.max(insets.bottom, 10),
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      }}
    >
      <Tab.Screen
        name="ChatsTab"
        component={ChatsScreen}
        options={{
          title: t('tabs.chats'),
          tabBarIcon: ({ color }) => <MessageCircle size={21} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="GistTab"
        component={GistScreen}
        options={{
          title: t('tabs.gist'),
          tabBarIcon: ({ color }) => <CircleDashed size={21} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="GroupsTab"
        component={GroupsScreen}
        options={{
          title: t('tabs.groups'),
          tabBarIcon: ({ color }) => <Users size={21} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="CallsTab"
        component={CallsScreen}
        options={{
          title: t('tabs.calls'),
          tabBarIcon: ({ color }) => <Phone size={21} color={color} strokeWidth={2} />,
        }}
      />
    </Tab.Navigator>
  );
}
