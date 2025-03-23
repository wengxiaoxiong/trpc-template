'use client'
import { MainPageLayout } from "@/app/components/MainPageLayout"
import { trpc } from "@/utils/trpc/client"
import { useState, useRef } from "react";
import { Upload, message, Card } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { FileList, FileListRef } from "../components/FileList";
import { FileType } from "@prisma/client";

const { Dragger } = Upload;

export default function FilesPage() {
    const [uploading, setUploading] = useState(false);
    const utils = trpc.useUtils();
    const fileListRef = useRef<FileListRef>(null);
    
    const {
        mutateAsync: createFileMutation,
    } = trpc.minio.createFile.useMutation();

    const uploadProps: UploadProps = {
        name: 'file',
        showUploadList: false,
        multiple: true,
        customRequest: async (options) => {
            const { onSuccess, onError, file } = options;
            const uploadFile = file as File;

            try {
                setUploading(true);
                
                // 为每个文件单独获取新的凭证
                const newCredentials = await utils.client.minio.getCredentials.query({
                    _randomParam: Date.now(),
                    _uniqueId: crypto.randomUUID()
                });
                
                if (!newCredentials) {
                    throw new Error('无法获取上传凭证');
                }

                const uploadUrl = newCredentials.uploadUrl;

                const response = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: uploadFile,
                    headers: {
                        'Content-Type': uploadFile.type || 'application/octet-stream',
                    }
                });

                if (response.ok) {
                    onSuccess?.(response);
                    await createFileMutation(
                        {
                            path: newCredentials.pathName,
                            type: uploadFile.type || 'application/octet-stream',
                            name: uploadFile.name,
                            size: uploadFile.size,
                            fileType: FileType.USER_UPLOADED_FILE,
                            description: '通过文件管理页面上传的文件'
                        }
                    )
                    message.success(`${uploadFile.name} 文件上传成功`);
                    
                    // 刷新文件列表
                    fileListRef.current?.refetchFiles();
                } else {
                    throw new Error('上传失败');
                }
            } catch (error) {
                onError?.(error as any);
                message.error(`${uploadFile.name} ${(error as Error).message || '文件上传失败'}`);
            } finally {
                setUploading(false);
            }
        },
    };

    return (
        <MainPageLayout>
            <div className="space-y-6">
                
                <Card title="文件上传" className="w-full">
                    <div className="text-gray-600 mb-6">
                        支持图片和非图片格式
                    </div>
                    <Dragger {...uploadProps}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                        <p className="ant-upload-hint">支持单个或批量上传，上传后自动创建文件记录</p>
                    </Dragger>
                    {uploading && <div className="text-gray-600 mt-4">上传中...</div>}
                </Card>

                <Card title="文件列表" className="w-full">
                    <FileList 
                        ref={fileListRef}
                    />
                </Card>
            </div>
        </MainPageLayout>
    );
}