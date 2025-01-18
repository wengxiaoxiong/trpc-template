'use client'

import React from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { StatCards } from './components/StatCards';

const App: React.FC = () => {

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-sm">
        <StatCards />

      </div>
    </DashboardLayout>
  );
};

export default App;