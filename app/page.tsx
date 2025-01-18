'use client'

import React from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TabNav } from './components/TabNav';
import { DataTable } from './components/DataTable';

const App: React.FC = () => {
  const { activeTab, setActiveTab, getTabData, columns } = useDashboardData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-[1440px] mx-auto px-6">
        <Header />
        <main className="space-y-6">
          <StatCards />
          <div className="bg-white rounded-lg shadow-sm">
            <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
            <DataTable activeTab={activeTab} data={getTabData()} columns={columns} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;