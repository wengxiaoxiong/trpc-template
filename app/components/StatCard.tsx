import React from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    iconColor: string;
  }
  
  export const StatCard = ({ title, value, icon, bgColor, iconColor }: StatCardProps) => {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
            {React.cloneElement(icon as React.ReactElement, { className: `text-xl ${iconColor}` })}
          </div>
        </div>
      </div>
    );
  };