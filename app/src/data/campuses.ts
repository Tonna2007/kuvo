import type { Campus } from '../types';

export const campuses: Campus[] = [
  { id: 'kaaf', name: 'KAAF University College', city: 'Buduburam, Ghana', initials: 'KA' },
  { id: 'unilag', name: 'University of Lagos', city: 'Lagos, Nigeria', initials: 'UL' },
  { id: 'uniben', name: 'University of Benin', city: 'Benin City, Nigeria', initials: 'UB' },
  { id: 'ui', name: 'University of Ibadan', city: 'Ibadan, Nigeria', initials: 'UI' },
  { id: 'oau', name: 'Obafemi Awolowo University', city: 'Ile-Ife, Nigeria', initials: 'OA' },
  { id: 'covenant', name: 'Covenant University', city: 'Ota, Nigeria', initials: 'CU' },
  { id: 'unn', name: 'University of Nigeria, Nsukka', city: 'Nsukka, Nigeria', initials: 'UN' },
  { id: 'lasu', name: 'Lagos State University', city: 'Lagos, Nigeria', initials: 'LS' },
];

export const defaultCampus = campuses[0];
