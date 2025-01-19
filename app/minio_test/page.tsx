'use client'
import { MainPageLayout } from "@/app/components/MainPageLayout"
import { trpc } from "@/utils/trpc/client"
import { useEffect, useState } from "react";
import { Upload, message, Table, Button, Image } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

export default function MinioTestPage() {
    const [uploading, setUploading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const { refetch: refetchCredentials } = trpc.minio.getCredentials.useQuery(undefined, {
        enabled: true
    });

    const { data: fileListData, refetch: refetchFiles } = trpc.minio.listFiles.useQuery({
        page: pagination.current,
        pageSize: pagination.pageSize
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
                
                // 为每个文件获取新的credentials
                const newCredentials = await refetchCredentials();
                if (!newCredentials.data) {
                    throw new Error('无法获取上传凭证');
                }

                // 使用新的上传URL
                const uploadUrl = newCredentials.data.uploadUrl;

                // 使用 fetch 上传
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
                            description: '通过Minio测试页面上传的文件'
                        }
                    )
                    message.success(`${uploadFile.name} 文件上传成功, 文件名: ${newCredentials.data.pathName}`);
                    refetchFiles();  // 刷新文件列表
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
            setSelectedPath(null); // 先重置状态
            await new Promise(resolve => setTimeout(resolve, 100)); // 等待状态更新
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

    const columns = [
        {
            title: '文件名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '预览',
            key: 'preview',
            render: (_: unknown, record: any) => (
                record.type.startsWith('image/') && (
                    <>
                        <Image
                            width={40}
                            src={record.url} // 假设record中有url字段
                            preview={{
                                src: record.url,
                            }}
                        />
                    </>
                )
            ),
        },
        {
            title: '下载',
            key: 'download',
            render: (_: unknown, record: any) => (
                <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(record)}
                />
            ),
        },
        {
            title: '删除',
            key: 'delete',
            render: (_: unknown, record: any) => (
                <Button
                    type="link"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record)}
                />
            ),
        },
    ];

    return (
        <MainPageLayout>
            <div className="flex flex-col items-center justify-center h-full">
                <div className="w-full ">
                    <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                        <div className="text-2xl font-bold text-gray-800 mb-4">
                            文件上传
                        </div>
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
                    </div>
                </div>
                <div className="w-full  mt-8">
                    <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                        <div className="text-2xl font-bold text-gray-800 mb-4">
                            文件列表
                        </div>
                        <Table
                            dataSource={fileListData?.files}
                            columns={columns}
                            rowKey="id"
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: fileListData?.total,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100']
                            }}
                            onChange={handleTableChange}
                        />
                    </div>
                </div>
            </div>
        </MainPageLayout>
    );
}