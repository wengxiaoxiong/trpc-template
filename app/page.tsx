'use client'

import React from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardLayout } from './components/DashboardLayout';
import { TabNav } from './components/TabNav';
import { DataTable } from './components/DataTable';

const App: React.FC = () => {
  const { activeTab, setActiveTab, getTabData, columns } = useDashboardData();

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-sm">
        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <DataTable activeTab={activeTab} data={getTabData()} columns={columns} />
      </div>
    </DashboardLayout>
  );
};

export default App;