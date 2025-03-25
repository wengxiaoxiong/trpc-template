import { Image } from 'antd';
import { useEffect, useState } from 'react';
import { trpc } from '@/utils/trpc/client';

interface MinioImageProps {
  pathName?: string;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  fallback?: string;
  preview?: boolean;
}

// 判断字符串是否为标准URL的函数
const isValidUrl = (string: string): boolean => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

export const MinioImage = ({
  pathName,
  width = 100,
  height = 100,
  className = '',
  alt = '预览图片',
  fallback,
  preview = true,
}: MinioImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const utils = trpc.useUtils();

  useEffect(() => {
    const loadImageUrl = async () => {
      if (!pathName) return;
      
      // 如果pathName已经是一个有效的URL，直接使用
      if (isValidUrl(pathName)) {
        setImageUrl(pathName);
        return;
      }
      
      // 否则，如果包含路径分隔符，尝试从Minio获取URL
      if (pathName.includes('/')) {
        try {
          const result = await utils.client.minio.getFileUrl.query({ path: pathName });
          setImageUrl(result.url);
        } catch (error) {
          console.error('获取图片URL失败:', error);
        }
      }
    };

    loadImageUrl();
  }, [pathName, utils.client.minio.getFileUrl]);

  if (!pathName || !imageUrl) {
    return null;
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fallback={fallback}
      preview={preview}
    />
  );
}; 