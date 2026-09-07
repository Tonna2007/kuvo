import type { FeedPost, Story } from '../types';

export const stories: Story[] = [
  { id: 'you', label: 'Your status', initials: '+', isYou: true },
  { id: 'tk', label: 'TK', initials: 'TK', tone: 'green' },
  { id: 'am', label: 'AM', initials: 'AM', tone: 'gold' },
  { id: 'bz', label: 'BZ', initials: 'BZ', tone: 'dark' },
  { id: 'cu', label: 'CU', initials: 'CU', tone: 'green' },
];

export const posts: FeedPost[] = [
  {
    id: 'p1',
    name: 'Tobi (KAAF)',
    time: '20m',
    text: 'Selling my old organic chem textbook, DM if interested',
    initials: 'TK',
    tone: 'green',
  },
  {
    id: 'p2',
    name: 'Amara (UNILAG)',
    time: '1h',
    text: 'Cross-campus meetup this Saturday was fire',
    initials: 'AM',
    tone: 'gold',
  },
  {
    id: 'p3',
    name: 'Bezu (UNIBEN)',
    time: '3h',
    text: "Anyone doing the Bio201 assignment? let's link",
    initials: 'BZ',
    tone: 'dark',
  },
  {
    id: 'p4',
    name: 'Chidera (UNILAG)',
    time: '5h',
    text: 'Photo dump from the tech fair',
    initials: 'CU',
    tone: 'green',
  },
];
