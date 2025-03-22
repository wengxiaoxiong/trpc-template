'use client'

import { Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { trpc } from '@/utils/trpc/client';
import { useState } from 'react';
import { MinioUploader } from '@/utils/minio/uploader';

const { Dragger } = Upload;

export const MinioFileUploader: React.FC<{
  onUploadComplete?: () => void;
  description?: string;
}> = ({ onUploadComplete, description }) => {
  const [uploading, setUploading] = useState(false);
  const utils = trpc.useUtils();

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    customRequest: async (options) => {
      const { onSuccess, onError, file, onProgress } = options;
      const uploadFile = file as File;

      try {
        setUploading(true);
        const uploader = MinioUploader.getInstance();

        await uploader.uploadFile({
          file: uploadFile,
          onSuccess,
          onError,
          onProgress: (percent) => {
            onProgress?.({ percent });
          },
          description,
          // 获取上传凭证的函数
          getCredentials: async () => {
            const result = await utils.client.minio.getCredentials.query();
            return result;
          },
          // 创建文件记录的函数
          createFileRecord: async (params) => {
            return await utils.client.minio.createFile.mutate(params);
          }
        });

        // 刷新文件列表（如果需要）
        onUploadComplete?.();

      } catch (error) {
        console.error('上传失败:', error);
      } finally {
        setUploading(false);
      }
    },
  };

  return (
    <div className="w-full">
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持单个或批量上传
        </p>
      </Dragger>
      {uploading && (
        <div className="mt-4 text-gray-600">
          上传中...
        </div>
      )}
    </div>
  );
}; 