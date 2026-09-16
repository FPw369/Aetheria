import React from 'react';
import { Calendar, Compass, BookHeart, CircleDot, Settings } from 'lucide-react';
import { useDuo } from '../context/DuoContext';

export function BottomNav({ activeTab, onSelectTab }) {
  const { audio } = useDuo();

  const tabs = [
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'journey', label: 'Journey', icon: Compass },
    { id: 'vault', label: 'Memory Vault', icon: BookHeart },
    { id: 'tools', label: 'Zen Matrix', icon: CircleDot },
    { id: 'settings', label: 'Sync & Duo', icon: Settings },
  ];

  const handleTabClick = (tabId) => {
    audio.playClick();
    onSelectTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#060813]/90 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 relative ${
                isActive
                  ? 'text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 w-6 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 shadow-neon-cyan" />
              )}
              <div className={`p-1 rounded-xl transition-all ${
                isActive ? 'bg-cyan-500/15 text-cyan-300 scale-110 shadow-sm' : ''
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono tracking-tight mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
