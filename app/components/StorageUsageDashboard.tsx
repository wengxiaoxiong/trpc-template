import { Progress, Card, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { trpc } from '@/utils/trpc/client';

const { Title, Text } = Typography;

interface StorageUsageDashboardProps {
  userId?: number;
  className?: string;
}

export const StorageUsageDashboard = ({ userId, className }: StorageUsageDashboardProps) => {
  const [totalUsage, setTotalUsage] = useState(0);
  const [maxStorage, setMaxStorage] = useState(2147483648); // 默认2GB
  const [percentage, setPercentage] = useState(0);

  // 获取当前用户信息（包含存储使用量）
  const { data: userData } = trpc.user.getCurrentUser.useQuery(undefined, {
    enabled: !userId, // 如果没有提供userId，则查询当前用户
  });

  // 如果提供了userId（管理员查看其他用户），则获取该用户信息
  const { data: targetUserData } = trpc.user.getUserById.useQuery(
    { id: userId as number },
    { enabled: !!userId }
  );

  // 获取最大存储空间配置
  const { data: configData } = trpc.config.getConfig.useQuery({
    key: 'user.storage.max'
  });

  useEffect(() => {
    // 设置用户存储使用量
    if (userId && targetUserData) {
      setTotalUsage(Number(targetUserData.storageUsed) || 0);
    } else if (userData) {
      setTotalUsage(Number(userData.storageUsed) || 0);
    }
  }, [userData, targetUserData, userId]);

  useEffect(() => {
    if (configData?.value) {
      setMaxStorage(parseInt(configData.value));
    }
  }, [configData]);

  useEffect(() => {
    const calculatedPercentage = (totalUsage / maxStorage) * 100;
    setPercentage(Math.min(calculatedPercentage, 100));
  }, [totalUsage, maxStorage]);

  // 格式化大小显示
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  // 确定进度条状态
  const getProgressStatus = () => {
    if (percentage >= 90) return "exception";
    if (percentage >= 70) return "normal";
    return "success";
  };

  return (
    <Card className={className}>
      <Title level={4}>存储空间使用情况</Title>
      <div className="mt-4">
        <Progress
          percent={parseFloat(percentage.toFixed(2))}
          status={getProgressStatus()}
          strokeWidth={10}
        />
        <div className="flex justify-between mt-2">
          <Text>已使用: {formatFileSize(totalUsage)}</Text>
          <Text>总容量: {formatFileSize(maxStorage)}</Text>
        </div>
        <div className="mt-2">
          <Text type={percentage > 90 ? "danger" : "secondary"}>
            {percentage > 90 
              ? "存储空间即将用完，请及时清理文件！" 
              : `剩余空间: ${formatFileSize(maxStorage - totalUsage)}`}
          </Text>
        </div>
      </div>
    </Card>
  );
}; 