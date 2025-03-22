import { Button, Select, Table, Tag } from 'antd';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { FileType } from '@prisma/client';
import { trpc } from '@/utils/trpc/client';
import { MinioImage } from './MinioImage';
import { message } from 'antd';

interface FileListProps {
    className?: string;
}

export const FileList: React.FC<FileListProps> = ({
    className
}) => {
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedFileType, setSelectedFileType] = useState<FileType | undefined>(undefined);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

    // 数据查询
    const { data: fileListData, refetch: refetchFiles } = trpc.minio.listFiles.useQuery({
        page: pagination.current,
        pageSize: pagination.pageSize,
        fileType: selectedFileType
    });

    // 删除文件
    const { mutateAsync: deleteFileMutation } = trpc.minio.deleteFile.useMutation();

    // 获取文件URL
    const { data: fileUrl, isLoading: isLoadingUrl } = trpc.minio.getFileUrl.useQuery(
        { path: selectedPath || '' },
        { enabled: !!selectedPath }
    );

    // 处理文件下载
    useEffect(() => {
        if (selectedPath && fileUrl?.url && !isLoadingUrl) {
            window.open(fileUrl.url, '_blank');
            setSelectedPath(null);
        }
    }, [selectedPath, fileUrl, isLoadingUrl]);

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

    const handleFileTypeChange = (value: FileType | undefined) => {
        setSelectedFileType(value);
        setPagination({ ...pagination, current: 1 });
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
                    <MinioImage
                        pathName={record.path}
                        width={40}
                        height={40}
                        preview={true}
                        className="object-cover"
                    />
                )
            ),
        },
        {
            title: '类型',
            key: 'fileType',
            render:(_:unknown, record: any)=>{
                const typeMap: Record<FileType, string> = {
                    [FileType.AI_GENERATED_IMAGE]: 'AI生成图片',
                    [FileType.USER_UPLOADED_FILE]: '用户上传文件',
                    [FileType.PARAMETER_IMAGE]: '参数图片'
                };
                return <Tag>{typeMap[record.fileType as FileType] || '未知类型'}</Tag>
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: any) => (
                <div className="space-x-2">
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(record)}
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </div>
            ),
        },
    ];

    const fileTypeOptions = [
        { label: '全部文件', value: undefined },
        { label: 'AI生成图片', value: FileType.AI_GENERATED_IMAGE },
        { label: '用户上传文件', value: FileType.USER_UPLOADED_FILE },
        { label: '参数图片', value: FileType.PARAMETER_IMAGE }
    ];

    return (
        <div className={className}>
            <div className="mb-4">
                <Select
                    placeholder="选择文件类型"
                    style={{ width: 200 }}
                    options={fileTypeOptions}
                    value={selectedFileType}
                    onChange={handleFileTypeChange}
                    allowClear
                />
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
                    pageSizeOptions: ['10', '20', '50', '100'],
                    onChange: (page, pageSize) => setPagination({ current: page, pageSize })
                }}
            />
        </div>
    );
}; 