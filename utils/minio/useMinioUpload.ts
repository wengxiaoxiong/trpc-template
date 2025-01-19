import { useState } from 'react';
import { message } from 'antd';
import { trpc } from '../trpc/client';
import { FileType } from '@prisma/client';

interface UseMinioUploadOptions {
  onSuccess?: (pathName: string) => void;
  onError?: (error: Error) => void;
  description?: string;
}

export function useMinioUpload(options: UseMinioUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const utils = trpc.useUtils();

  const uploadFile = async (file: File, fileType?: FileType): Promise<string> => {
    try {
      setIsUploading(true);

      // 获取上传凭证
      const credentials = await utils.client.minio.getCredentials.query();
      if (!credentials) {
        throw new Error('无法获取上传凭证');
      }

      // 使用 fetch 上传文件
      const response = await fetch(credentials.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        }
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      // 创建文件记录
      await utils.client.minio.createFile.mutate({
        path: credentials.pathName,
        type: file.type || 'application/octet-stream',
        name: file.name,
        fileType: fileType || FileType.USER_UPLOADED_FILE,
        size: file.size,
        description: options.description
      });

      message.success(`${file.name} 文件上传成功`);
      options.onSuccess?.(credentials.pathName);
      return credentials.pathName;

    } catch (error) {
      const err = error as Error;
      message.error(`${file.name} ${err.message || '文件上传失败'}`);
      options.onError?.(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<Array<{ file: File; pathName?: string; error?: Error }>> => {
    const results = [];
    for (const file of files) {
      try {
        const pathName = await uploadFile(file);
        results.push({ file, pathName });
      } catch (error) {
        results.push({ file, error: error as Error });
      }
    }
    return results;
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    isUploading
  };
} 