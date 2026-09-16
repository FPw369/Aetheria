import React, { useState } from 'react';
import { DuoProvider } from './context/DuoContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { TodayView } from './components/views/TodayView';
import { JourneyView } from './components/views/JourneyView';
import { MemoryVaultView } from './components/views/MemoryVaultView';
import { ZenToolsView } from './components/views/ZenToolsView';
import { SyncSettingsView } from './components/views/SyncSettingsView';
import { DayDetailModal } from './components/DayDetailModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('today');
  const [activeModalDay, setActiveModalDay] = useState(null);

  return (
    <div className="relative min-h-screen bg-[#060813] text-slate-100 cyber-grid overflow-x-hidden flex flex-col justify-between">
      {/* Ambient background glows */}
      <div className="ambient-glow-top" />
      <div className="ambient-glow-partner-b" />

      {/* Top Navbar with couple switcher & status */}
      <Navbar />

      {/* Main View Area */}
      <main className="relative z-10 flex-1 max-w-md w-full mx-auto px-4 pt-4">
        {activeTab === 'today' && (
          <TodayView
            onOpenDayDetail={setActiveModalDay}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'journey' && (
          <JourneyView
            onOpenDayDetail={setActiveModalDay}
          />
        )}

        {activeTab === 'vault' && (
          <MemoryVaultView
            onOpenDayDetail={setActiveModalDay}
          />
        )}

        {activeTab === 'tools' && (
          <ZenToolsView />
        )}

        {activeTab === 'settings' && (
          <SyncSettingsView />
        )}
      </main>

      {/* Day Interactive Detail Modal */}
      {activeModalDay && (
        <DayDetailModal
          dayData={activeModalDay}
          onClose={() => setActiveModalDay(null)}
        />
      )}

      {/* Bottom Mobile Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <DuoProvider>
      <AppContent />
    </DuoProvider>
  );
}
