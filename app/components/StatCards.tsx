
import { BulbOutlined, CloudServerOutlined, DeploymentUnitOutlined, ScheduleOutlined } from '@ant-design/icons';

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

export const StatCards = () => {
  return (
    <div className="grid grid-cols-4 gap-6">
      <StatCard
        title="特征模板"
        value={24}
        icon={<BulbOutlined />}
        bgColor="bg-blue-100"
        iconColor="text-blue-500"
      />
      <StatCard
        title="服务器节点"
        value={8}
        icon={<CloudServerOutlined />}
        bgColor="bg-indigo-100"
        iconColor="text-indigo-500"
      />
      <StatCard
        title="工作流"
        value={16}
        icon={<DeploymentUnitOutlined />}
        bgColor="bg-green-100"
        iconColor="text-green-500"
      />
      <StatCard
        title="运行任务"
        value={32}
        icon={<ScheduleOutlined />}
        bgColor="bg-purple-100"
        iconColor="text-purple-500"
      />
    </div>
  );
};