import { defaultCampus } from './campuses';
import type { UserProfile } from '../types';

export const emptyProfile: UserProfile = {
  name: '',
  username: '',
  about: '',
  phone: '',
  countryCode: '+234',
  campus: defaultCampus,
  verified: false,
  schoolEmail: '',
  twoStep: false,
  lowDataMode: true,
  autoDownloadPhotos: false,
  autoDownloadDocuments: false,
  showLastSeen: true,
  readReceipts: true,
  showCampusBadge: true,
  notifications: {
    messages: true,
    groups: true,
    preview: true,
    sound: true,
    vibrate: false,
  },
  themeMode: 'light',
  themeColor: '#145C38',
  wallpaper: '#FFFFFF',
  blockedCount: 2,
  avatarUri: null,
};

export const demoProfile: UserProfile = {
  ...emptyProfile,
  name: 'Eme T. Emmanuel',
  username: 'eme',
  about: 'PharmD student, KAAF University College',
  phone: '8012345678',
  countryCode: '+234',
  campus: defaultCampus,
  verified: false,
  schoolEmail: 'eme@kaaf.edu.gh',
  avatarUri: 'https://ui-avatars.com/api/?name=Eme+Emmanuel&background=145C38&color=fff&size=200',
};
