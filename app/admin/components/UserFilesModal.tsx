'use client';

import { Modal } from 'antd';
import { FileList } from '@/app/components/FileList';
import { StorageUsageDashboard } from '@/app/components/StorageUsageDashboard';

interface UserFilesModalProps {
  userId: number;
  visible: boolean;
  onClose: () => void;
}

export default function UserFilesModal({ userId, visible, onClose }: UserFilesModalProps) {
  return (
    <Modal
      title="用户文件管理"
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <div className="space-y-4">
        <StorageUsageDashboard userId={userId} />
        <FileList userId={userId} />
      </div>
    </Modal>
  );
} 