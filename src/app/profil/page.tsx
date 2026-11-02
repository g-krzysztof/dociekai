import { Metadata } from 'next';
import { ProfilePageClient } from './profile-client';

export const metadata: Metadata = {
  title: 'Profil użytkownika - DociekAI',
  description: 'Zarządzaj swoim profilem DociekAI',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
