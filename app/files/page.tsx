'use client'
import { MainPageLayout } from "@/app/components/MainPageLayout"
import { trpc } from "@/utils/trpc/client"
import { useEffect, useState } from "react";
import { Upload, message, Card } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { MinioFileUploader } from "../components/MinioUploader";
import { FileList } from "../components/FileList";
import { FileType } from "@prisma/client";

const { Dragger } = Upload;

export default function MinioTestPage() {
    const [uploading, setUploading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedFileType, setSelectedFileType] = useState<'AI_GENERATED_IMAGE' | 'USER_UPLOADED_FILE' | 'PARAMETER_IMAGE' | undefined>(undefined);
    const { refetch: refetchCredentials } = trpc.minio.getCredentials.useQuery(undefined, {
        enabled: true
    });

    const { data: fileListData, refetch: refetchFiles } = trpc.minio.listFiles.useQuery({
        page: pagination.current,
        pageSize: pagination.pageSize,
        fileType: selectedFileType
    });
    const { mutateAsync: deleteFileMutation } = trpc.minio.deleteFile.useMutation();

    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const { data: fileUrl, isLoading: isLoadingUrl } = trpc.minio.getFileUrl.useQuery(
        { path: selectedPath || '' },
        { enabled: !!selectedPath }
    );

    useEffect(() => {
        if (selectedPath && fileUrl?.url && !isLoadingUrl) {
            window.open(fileUrl.url, '_blank');
        }
    }, [selectedPath, fileUrl, isLoadingUrl]);

    const {
        mutateAsync: createFileMutation,
    } = trpc.minio.createFile.useMutation();

    const handleTableChange = (pagination: any) => {
        setPagination({
            current: pagination.current,
            pageSize: pagination.pageSize
        });
    };

    const uploadProps: UploadProps = {
        name: 'file',
        showUploadList: false,
        multiple: true,
        customRequest: async (options) => {
            const { onSuccess, onError, file } = options;
            const uploadFile = file as File;

            try {
                setUploading(true);
                
                const newCredentials = await refetchCredentials();
                if (!newCredentials.data) {
                    throw new Error('无法获取上传凭证');
                }

                const uploadUrl = newCredentials.data.uploadUrl;

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
                            path: newCredentials.data.pathName,
                            type: uploadFile.type || 'application/octet-stream',
                            name: uploadFile.name,
                            size: uploadFile.size,
                            fileType: FileType.USER_UPLOADED_FILE,
                            description: '通过Minio测试页面上传的文件'
                        }
                    )
                    message.success(`${uploadFile.name} 文件上传成功, 文件名: ${newCredentials.data.pathName}`);
                    refetchFiles();
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
        onChange(info) {
            const { status } = info.file;
            if (status === 'uploading') {
                setUploading(true);
            }
            if (status === 'done') {
                setUploading(false);
            } else if (status === 'error') {
                setUploading(false);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    const handleDownload = async (file: any) => {
        try {
            setSelectedPath(null);
            await new Promise(resolve => setTimeout(resolve, 100));
            setSelectedPath(file.path);
        } catch (error) {
            message.error('下载失败');
        }
    };

    const handleDelete = async (file: any) => {
        try {
            await deleteFileMutation({ id: file.id });
            message.success('文件删除成功');
            refetchFiles();
        } catch (error) {
            message.error('文件删除失败');
        }
    };

    const handleFileTypeChange = (value: 'AI_GENERATED_IMAGE' | 'USER_UPLOADED_FILE' | 'PARAMETER_IMAGE' | undefined) => {
        setSelectedFileType(value);
        setPagination({ ...pagination, current: 1 });
    };

    return (
        <MainPageLayout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">文件管理</h1>
                
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
                        fileListData={fileListData}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onPaginationChange={handleTableChange}
                        pagination={pagination}
                        selectedFileType={selectedFileType}
                        onFileTypeChange={handleFileTypeChange}
                    />
                </Card>
            </div>
        </MainPageLayout>
    );
}