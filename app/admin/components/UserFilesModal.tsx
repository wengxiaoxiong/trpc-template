'use client';

import { Modal } from 'antd';
import { FileList } from '@/app/components/FileList';

interface UserFilesModalProps {
  userId: number;
  visible: boolean;
  onClose: () => void;
}

export default function UserFilesModal({ userId, visible, onClose }: UserFilesModalProps) {
  return (
    <Modal
      title="用户文件列表"
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <FileList userId={userId} />
    </Modal>
  );
} 