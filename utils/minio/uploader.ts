import { message } from 'antd';

export interface UploadOptions {
  file: File;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  onProgress?: (percent: number) => void;
  description?: string;
  getCredentials: () => Promise<{
    uploadUrl: string;
    endPoint: string;
    bucket: string;
    pathName: string;
  }>;
  createFileRecord: (params: {
    path: string;
    type: string;
    name: string;
    size: number;
    description?: string;
  }) => Promise<any>;
}

export class MinioUploader {
  private static instance: MinioUploader;
  private isUploading: boolean = false;

  private constructor() {}

  public static getInstance(): MinioUploader {
    if (!MinioUploader.instance) {
      MinioUploader.instance = new MinioUploader();
    }
    return MinioUploader.instance;
  }

  public isFileUploading(): boolean {
    return this.isUploading;
  }

  public async uploadFile(options: UploadOptions) {
    const { 
      file, 
      onSuccess, 
      onError, 
      onProgress, 
      description = '通过 MinioUploader 上传的文件',
      getCredentials,
      createFileRecord
    } = options;

    try {
      this.isUploading = true;
      onProgress?.(0);

      // 获取上传凭证
      const credentials = await getCredentials();
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
      await createFileRecord({
        path: credentials.pathName,
        type: file.type || 'application/octet-stream',
        name: file.name,
        size: file.size,
        description
      });

      onProgress?.(100);
      onSuccess?.(response);
      message.success(`${file.name} 文件上传成功`);

      return {
        success: true,
        pathName: credentials.pathName,
        response
      };

    } catch (error) {
      const err = error as Error;
      onError?.(err);
      message.error(`${file.name} ${err.message || '文件上传失败'}`);
      throw err;
    } finally {
      this.isUploading = false;
    }
  }

  public async uploadMultipleFiles(files: File[], options: Omit<UploadOptions, 'file'>) {
    const results = [];
    for (const file of files) {
      try {
        const result = await this.uploadFile({
          ...options,
          file
        });
        results.push({ file, result, success: true });
      } catch (error) {
        results.push({ file, error, success: false });
      }
    }
    return results;
  }
}

export async function uploadFileToMinio(
  file: File,
  {
    getCredentials,
    createFileRecord,
    description = '通过 uploadFileToMinio 上传的文件'
  }: {
    getCredentials: () => Promise<{
      uploadUrl: string;
      endPoint: string;
      bucket: string;
      pathName: string;
    }>;
    createFileRecord: (params: {
      path: string;
      type: string;
      name: string;
      size: number;
      description?: string;
    }) => Promise<any>;
    description?: string;
  }
): Promise<string> {
  try {
    // 获取上传凭证
    const credentials = await getCredentials();
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
    await createFileRecord({
      path: credentials.pathName,
      type: file.type || 'application/octet-stream',
      name: file.name,
      size: file.size,
      description
    });

    message.success(`${file.name} 文件上传成功`);
    return credentials.pathName;

  } catch (error) {
    const err = error as Error;
    message.error(`${file.name} ${err.message || '文件上传失败'}`);
    throw err;
  }
} 