import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CallScreen } from '../screens/calls/CallScreen';
import { NewCallScreen } from '../screens/calls/NewCallScreen';
import { ContactInfoScreen } from '../screens/chats/ContactInfoScreen';
import { ConversationScreen } from '../screens/chats/ConversationScreen';
import { NewChatScreen } from '../screens/chats/NewChatScreen';
import { HelpScreen } from '../screens/profile/HelpScreen';
import { LanguageScreen } from '../screens/profile/LanguageScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { StoryViewerScreen } from '../screens/gist/StoryViewerScreen';
import { GroupInfoScreen } from '../screens/groups/GroupInfoScreen';
import { NewGroupDetailsScreen } from '../screens/groups/NewGroupDetailsScreen';
import { NewGroupMembersScreen } from '../screens/groups/NewGroupMembersScreen';
import { AddCampusScreen } from '../screens/onboarding/AddCampusScreen';
import { CampusScreen } from '../screens/onboarding/CampusScreen';
import { NameScreen } from '../screens/onboarding/NameScreen';
import { OtpScreen } from '../screens/onboarding/OtpScreen';
import { PhoneScreen } from '../screens/onboarding/PhoneScreen';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { VerifyCampusScreen } from '../screens/onboarding/VerifyCampusScreen';
import { AccountScreen } from '../screens/profile/AccountScreen';
import { AppearanceScreen } from '../screens/profile/AppearanceScreen';
import { DataScreen } from '../screens/profile/DataScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { PrivacyScreen } from '../screens/profile/PrivacyScreen';
import { SettingDetailScreen } from '../screens/profile/SettingDetailScreen';
import { WallpaperScreen } from '../screens/profile/WallpaperScreen';
import { useColors } from '../theme';
import { navigationRef } from './ref';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const colors = useColors();
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Phone" component={PhoneScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="Name" component={NameScreen} />
        <Stack.Screen name="Campus" component={CampusScreen} />
        <Stack.Screen name="Verify" component={VerifyCampusScreen} />
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ animation: 'fade' }} />
        <Stack.Screen name="NewChat" component={NewChatScreen} />
        <Stack.Screen name="NewCall" component={NewCallScreen} />
        <Stack.Screen name="Call" component={CallScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Conversation" component={ConversationScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="StoryViewer" component={StoryViewerScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="SettingDetail" component={SettingDetailScreen} />
        <Stack.Screen name="ContactInfo" component={ContactInfoScreen} />
        <Stack.Screen name="NewGroupMembers" component={NewGroupMembersScreen} />
        <Stack.Screen name="NewGroupDetails" component={NewGroupDetailsScreen} />
        <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Data" component={DataScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Appearance" component={AppearanceScreen} />
        <Stack.Screen name="Wallpaper" component={WallpaperScreen} />
        <Stack.Screen name="AddCampus" component={AddCampusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
