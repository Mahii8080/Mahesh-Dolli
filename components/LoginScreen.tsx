import React from 'react';

interface LoginScreenProps {
  onGetStarted: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-blue-900">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in-down">
          MakePrepWithMe
        </h1>
        <p className="text-lg md:text-2xl text-blue-300 mb-8 animate-fade-in-up">
          Your Personal AI Interview Coach
        </p>
        <button
          onClick={onGetStarted}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg shadow-blue-600/50 transform hover:scale-105 transition-all duration-300"
        >
          Get Started
        </button>
      </div>
      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-gray-500 text-sm">Prepare smarter, not just harder.</p>
        <p className="text-gray-400 text-sm mt-1 font-light">developed by Team Techtitans</p>
      </footer>
    </div>
  );
};

export default LoginScreen;