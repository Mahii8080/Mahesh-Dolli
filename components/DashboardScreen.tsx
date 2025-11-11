
import React, { useState } from 'react';
import { Subject, Difficulty } from '../types';

interface DashboardScreenProps {
  onStartInterview: (subject: Subject, difficulty: Difficulty) => void;
  onViewProfile: () => void;
}

interface SubjectItem {
  name: Subject;
  icon: string;
}

interface Category {
  title: string;
  subjects: SubjectItem[];
}

const categories: Category[] = [
  {
    title: 'Engineering',
    subjects: [
      { name: Subject.Java, icon: '☕' },
      { name: Subject.Python, icon: '🐍' },
      { name: Subject.DSA, icon: '📊' },
      { name: Subject.JavaScript, icon: '🟨' },
      { name: Subject.TypeScript, icon: '🟦' },
      { name: Subject.C_Plus_Plus, icon: '⚙️' },
      { name: Subject.C_Sharp, icon: '#️⃣' },
      { name: Subject.Go, icon: '🐹' },
      { name: Subject.Rust, icon: '🦀' },
      { name: Subject.Kotlin, icon: '🤖' },
      { name: Subject.Swift, icon: '🐦' },
      { name: Subject.PHP, icon: '🐘' },
      { name: Subject.Ruby, icon: '💎' },
    ]
  },
  {
    title: 'Professional Skills',
    subjects: [
      { name: Subject.HR, icon: '🤝' },
      { name: Subject.English, icon: '🗣️' },
    ]
  },
  {
    title: 'Competitive Exams',
    subjects: [
      { name: Subject.GATE, icon: '🎓' },
      { name: Subject.UPSC, icon: '🏛️' },
    ]
  }
];

const DifficultyModal: React.FC<{
    subject: Subject;
    onSelect: (difficulty: Difficulty) => void;
    onClose: () => void;
}> = ({ subject, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in-up">
            <div className="bg-gray-800 rounded-lg p-8 shadow-xl max-w-sm w-full text-center border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-2">Select Difficulty</h2>
                <p className="text-lg text-gray-300 mb-6">for <span className="font-bold text-blue-400">{subject}</span></p>
                <div className="flex flex-col space-y-4">
                    <button onClick={() => onSelect('Beginner')} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                        Beginner
                    </button>
                    <button onClick={() => onSelect('Intermediate')} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                        Intermediate
                    </button>
                    <button onClick={() => onSelect('Advanced')} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                        Advanced
                    </button>
                </div>
                <button onClick={onClose} className="mt-6 text-gray-400 hover:text-white transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    );
};


const DashboardScreen: React.FC<DashboardScreenProps> = ({ onStartInterview, onViewProfile }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleDifficultySelect = (difficulty: Difficulty) => {
    if (selectedSubject) {
      onStartInterview(selectedSubject, difficulty);
      setSelectedSubject(null);
    }
  };

  return (
    <>
      <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center w-full">
        <header className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4 sm:gap-0">
          <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Welcome Back!</h1>
              <p className="text-md sm:text-lg text-gray-400">Choose your preparation module to get started.</p>
          </div>
          <button
              onClick={onViewProfile}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors self-start sm:self-auto"
          >
              View Profile
          </button>
        </header>

        <div className="w-full max-w-6xl space-y-12">
          {categories.map((category) => (
            <div key={category.title}>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 border-b-2 border-gray-700 pb-3">{category.title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {category.subjects.map((subject) => (
                  <button
                    key={subject.name}
                    onClick={() => setSelectedSubject(subject.name)}
                    className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-blue-800/50 hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="text-4xl sm:text-5xl mb-3 transition-transform duration-300 group-hover:scale-110">{subject.icon}</div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">{subject.name}</h3>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedSubject && (
        <DifficultyModal
          subject={selectedSubject}
          onSelect={handleDifficultySelect}
          onClose={() => setSelectedSubject(null)}
        />
      )}
    </>
  );
};

export default DashboardScreen;
