import { Tag } from "antd";

interface StatusTagProps {
    status: string;
  }
  
  const statusColorMap: { [key: string]: string } = {
    '初始化': '#6B7280',
    '运行中': '#3B82F6',
    '成功': '#10B981',
    '失败': '#EF4444'
  };
  
  export const StatusTag = ({ status }: StatusTagProps) => {
    return (
      <Tag color={statusColorMap[status] || '#6B7280'} className="rounded-full px-3 py-1">
        {status}
      </Tag>
    );
  };