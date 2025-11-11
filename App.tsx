
import React, { useState, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import InterviewSessionScreen from './components/InterviewSessionScreen';
import ProfileScreen from './components/ProfileScreen';
import { Subject, View, Difficulty } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | null>(null);

  const handleStartInterview = useCallback((subject: Subject, difficulty: Difficulty) => {
    setCurrentSubject(subject);
    setCurrentDifficulty(difficulty);
    setView('session');
  }, []);

  const handleEndInterview = useCallback(() => {
    setView('dashboard');
    setCurrentSubject(null);
    setCurrentDifficulty(null);
  }, []);

  const renderView = () => {
    switch (view) {
      case 'login':
        return <LoginScreen onGetStarted={() => setView('dashboard')} />;
      case 'dashboard':
        return <DashboardScreen onStartInterview={handleStartInterview} onViewProfile={() => setView('profile')} />;
      case 'profile':
        return <ProfileScreen onBack={() => setView('dashboard')} />;
      case 'session':
        if (currentSubject && currentDifficulty) {
          return <InterviewSessionScreen subject={currentSubject} difficulty={currentDifficulty} onEndSession={handleEndInterview} />;
        }
        // Fallback to dashboard if session details are missing, without causing a side-effect during render.
        return <DashboardScreen onStartInterview={handleStartInterview} onViewProfile={() => setView('profile')} />;
      default:
        return <LoginScreen onGetStarted={() => setView('dashboard')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {renderView()}
    </div>
  );
};

export default App;