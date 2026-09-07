import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToProfile() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Profile');
  }
}

export function navigateToSetting(settingId: string) {
  if (navigationRef.isReady()) {
    if (settingId === 'account') navigationRef.navigate('Account');
    else navigationRef.navigate('SettingDetail', { settingId });
  }
}

export function navigateToContact(chatId: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('ContactInfo', { chatId });
  }
}

export function navigateToGroups() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Tabs', { screen: 'GroupsTab' });
  }
}

export function navigateToNewChat() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('NewChat');
  }
}

export function navigateToNewGroup() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('NewGroupMembers');
  }
}

export function navigateToGroupInfo(chatId: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('GroupInfo', { chatId });
  }
}
