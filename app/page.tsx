'use client'

import React from 'react';
import { MainPageLayout } from './components/MainPageLayout';
import { WorkflowList } from './components/WorkflowList';

const App: React.FC = () => {

  return (
    <MainPageLayout>
      <div className="bg-white rounded-lg shadow-sm">
        <WorkflowList />

      </div>
    </MainPageLayout>
  );
};

export default App;