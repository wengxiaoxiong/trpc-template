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
      if (pathName && pathName.includes('/')) {
        try {
          const result = await utils.client.minio.getFileUrl.query({ path: pathName });
          setImageUrl(result.url);
        } catch (error) {
          console.error('获取图片URL失败:', error);
        }
      }
    };

    loadImageUrl();
  }, [pathName]);

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