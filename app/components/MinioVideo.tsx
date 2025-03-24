import { useEffect, useState, forwardRef } from 'react';
import { trpc } from '@/utils/trpc/client';
import { useI18n } from '../i18n-provider';

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

export const MinioVideo = forwardRef<HTMLVideoElement, MinioVideoProps>(({
  pathName,
  width = 300,
  height = 'auto',
  className = '',
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
}, ref) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const utils = trpc.useUtils();
  const { t } = useI18n();

  useEffect(() => {
    const loadVideoUrl = async () => {
      if (pathName && pathName.includes('/')) {
        try {
          const result = await utils.client.minio.getFileUrl.query({ path: pathName });
          setVideoUrl(result.url);
        } catch (error) {
          console.error(t('common.error') + ': ' + t('获取视频URL失败'), error);
        }
      }
    };

    loadVideoUrl();
  }, [pathName, utils.client.minio.getFileUrl, t]);

  if (!pathName || !videoUrl) {
    return null;
  }

  return (
    <video
      ref={ref}
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
});

MinioVideo.displayName = 'MinioVideo'; 