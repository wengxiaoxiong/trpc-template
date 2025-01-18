 'use client'

import React from 'react';
import { Header } from './Header';
import { StatCards } from './StatCards';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-[1440px] mx-auto px-6">
        <Header />
        <main className="space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};