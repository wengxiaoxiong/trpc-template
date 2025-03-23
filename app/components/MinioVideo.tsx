import { useEffect, useState } from 'react';
import { trpc } from '@/utils/trpc/client';

interface MinioVideoProps {
  pathName?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export const MinioVideo = ({
  pathName,
  width = 300,
  height = 'auto',
  className = '',
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
}: MinioVideoProps) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const utils = trpc.useUtils();

  useEffect(() => {
    const loadVideoUrl = async () => {
      if (pathName && pathName.includes('/')) {
        try {
          const result = await utils.client.minio.getFileUrl.query({ path: pathName });
          setVideoUrl(result.url);
        } catch (error) {
          console.error('获取视频URL失败:', error);
        }
      }
    };

    loadVideoUrl();
  }, [pathName, utils.client.minio.getFileUrl]);

  if (!pathName || !videoUrl) {
    return null;
  }

  return (
    <video
      src={videoUrl}
      width={width}
      height={height}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
    />
  );
}; 