import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type TabParamList = {
  ChatsTab: undefined;
  GistTab: undefined;
  GroupsTab: undefined;
  CallsTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Phone: undefined;
  Otp: undefined;
  Name: undefined;
  Campus: { mode?: 'settings' } | undefined;
  Verify: { mode?: 'settings' } | undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  NewChat: undefined;
  NewCall: undefined;
  Call: { username: string; name: string; direction: 'in' | 'out' };
  Conversation: { chatId: string };
  Profile: undefined;
  Help: undefined;
  Language: undefined;
  StoryViewer: { storyId: string };
  SettingDetail: { settingId: string };
  ContactInfo: { chatId: string };
  NewGroupMembers: undefined;
  NewGroupDetails: { memberNames: string[] };
  GroupInfo: { chatId: string };
  EditProfile: undefined;
  Account: undefined;
  Privacy: undefined;
  Data: undefined;
  Notifications: undefined;
  Appearance: undefined;
  Wallpaper: { chatId?: string };
  AddCampus: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
