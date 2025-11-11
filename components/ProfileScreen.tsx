
import React, { useState, useEffect } from 'react';
import { ProfileData } from '../types';
import { getProfileData, getAllBadges } from '../services/profileService';

interface ProfileScreenProps {
  onBack: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 flex items-center space-x-4">
    <div className="text-3xl sm:text-4xl">{icon}</div>
    <div>
      <div className="text-2xl sm:text-3xl font-bold text-white">{value}</div>
      <div className="text-xs sm:text-sm text-gray-400">{label}</div>
    </div>
  </div>
);

const BadgeDisplay: React.FC<{ badge: { name: string; description: string; icon: string; earned: boolean } }> = ({ badge }) => (
    <div className={`bg-gray-800 p-4 rounded-lg text-center transition-all duration-300 ${badge.earned ? 'border-2 border-yellow-400' : 'opacity-40'}`}>
        <div className={`text-5xl mx-auto mb-2 ${badge.earned ? '' : 'filter grayscale'}`}>{badge.icon}</div>
        <h3 className="font-bold text-white">{badge.name}</h3>
        <p className="text-xs text-gray-400">{badge.description}</p>
    </div>
);


const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const badges = getAllBadges();

  useEffect(() => {
    setProfile(getProfileData());
  }, []);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center w-full animate-fade-in-up">
      <header className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Your Profile</h1>
          <p className="text-md sm:text-lg text-gray-400">Keep track of your progress and achievements.</p>
        </div>
        <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors self-start sm:self-auto">
          Back to Dashboard
        </button>
      </header>
      
      <div className="w-full max-w-5xl space-y-8">
        {/* Stats Grid */}
        <section>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 border-b-2 border-gray-700 pb-3">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Interviews Completed" value={profile.interviewsCompleted} icon="📈" />
                <StatCard label="Average Score" value={profile.averageScore.toFixed(1)} icon="⭐" />
                <StatCard label="Current Streak" value={profile.currentStreak} icon="🔥" />
                <StatCard label="Longest Streak" value={profile.longestStreak} icon="🏅" />
            </div>
        </section>

        {/* Badges Section */}
        <section>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 border-b-2 border-gray-700 pb-3">Badges</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {badges.map(badge => (
                    <BadgeDisplay key={badge.name} badge={badge} />
                ))}
            </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileScreen;
