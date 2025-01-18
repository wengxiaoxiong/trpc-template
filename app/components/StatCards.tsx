import { StatCard } from './StatCard';
import { BulbOutlined, CloudServerOutlined, DeploymentUnitOutlined, ScheduleOutlined } from '@ant-design/icons';

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