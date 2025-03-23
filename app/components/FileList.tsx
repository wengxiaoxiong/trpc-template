import { Button, Select, Table, Tag, Tooltip, Modal, Input, Form } from 'antd';
import { DownloadOutlined, DeleteOutlined, EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FileType } from '@prisma/client';
import { trpc } from '@/utils/trpc/client';
import { MinioImage } from './MinioImage';
import { message } from 'antd';

interface FileListProps {
    className?: string;
    userId?: number;
}

export interface FileListRef {
    refetchFiles: () => void;
}

export const FileList = forwardRef<FileListRef, FileListProps>(({
    className,
    userId
}, ref) => {
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedFileType, setSelectedFileType] = useState<FileType | undefined>(undefined);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [currentFile, setCurrentFile] = useState<any>(null);
    const [newFileName, setNewFileName] = useState('');
    const [form] = Form.useForm();

    // 数据查询
    const { data: fileListData, refetch: refetchFiles } = userId 
        ? trpc.user.getUserFiles.useQuery({
            userId,
            page: pagination.current,
            pageSize: pagination.pageSize,
        })
        : trpc.minio.listFiles.useQuery({
            page: pagination.current,
            pageSize: pagination.pageSize,
            fileType: selectedFileType
        });

    // 暴露refetchFiles方法给父组件
    useImperativeHandle(ref, () => ({
        refetchFiles
    }));

    // 监听文件上传成功事件，刷新文件列表
    useEffect(() => {
        const handleFileUploaded = () => {
            refetchFiles();
        };

        window.addEventListener('fileUploaded', handleFileUploaded);
        
        return () => {
            window.removeEventListener('fileUploaded', handleFileUploaded);
        };
    }, [refetchFiles]);

    // 删除文件
    const { mutateAsync: deleteFileMutation } = trpc.minio.deleteFile.useMutation();
    
    // 重命名文件
    const { mutateAsync: renameFileMutation } = trpc.minio.renameFile.useMutation();

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
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除文件 "${file.name}" 吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    await deleteFileMutation({ id: file.id });
                    message.success('文件删除成功');
                    refetchFiles();
                } catch (error) {
                    message.error('文件删除失败');
                }
            }
        });
    };

    const handleRenameClick = (file: any) => {
        setCurrentFile(file);
        // 分离文件名和扩展名
        const fileNameParts = file.name.split('.');
        const extension = fileNameParts.length > 1 ? fileNameParts.pop() : '';
        const baseName = fileNameParts.join('.');
        
        // 只设置基本文件名（不含扩展名）
        form.setFieldsValue({ baseName });
        setRenameModalVisible(true);
    };

    const handleRenameSubmit = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();
            
            if (currentFile) {
                // 分离当前文件名和扩展名
                const fileNameParts = currentFile.name.split('.');
                const extension = fileNameParts.length > 1 ? fileNameParts.pop() : '';
                
                // 构建新文件名 = 新基本名 + 原扩展名
                const newFullName = extension ? `${values.baseName}.${extension}` : values.baseName;
                
                if (newFullName !== currentFile.name) {
                    await renameFileMutation({
                        id: currentFile.id,
                        newName: newFullName
                    });
                    message.success('文件重命名成功');
                    refetchFiles();
                }
            }
            setRenameModalVisible(false);
        } catch (error) {
            message.error('文件重命名失败');
        }
    };

    const handleFileTypeChange = (value: FileType | undefined) => {
        setSelectedFileType(value);
        setPagination({ ...pagination, current: 1 });
    };

    // 处理文件分享（复制下载链接）
    const handleShare = async (file: any) => {
        try {
            // 保存当前路径
            const currentPath = selectedPath;
            
            // 设置要获取URL的文件路径
            setSelectedPath(file.path);
            
            // 等待URL加载完成
            const checkUrl = async () => {
                if (fileUrl?.url && selectedPath === file.path) {
                    await navigator.clipboard.writeText(fileUrl.url);
                    message.success('下载链接已复制到剪贴板');
                    // 恢复原来的路径
                    setSelectedPath(currentPath);
                } else if (!isLoadingUrl && selectedPath === file.path) {
                    message.error('获取分享链接失败');
                    setSelectedPath(currentPath);
                } else {
                    // 继续等待
                    setTimeout(checkUrl, 100);
                }
            };
            
            // 启动检查
            setTimeout(checkUrl, 100);
        } catch (error) {
            console.error('分享失败:', error);
            message.error('复制链接失败');
        }
    };

    // 响应式列配置
    const columns = [
        {
            title: '文件名',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            width: 200,
            render: (text: string) => {
                return (
                    <Tooltip title={text} placement="top">
                        <div className="font-medium truncate max-w-[200px]">
                            {text}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: '预览',
            key: 'preview',
            width: 80,
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
            width: 120,
            render:(_:unknown, record: any)=>{
                const typeMap: Record<FileType, string> = {
                    [FileType.AI_GENERATED_IMAGE]: 'AI生成图片',
                    [FileType.USER_UPLOADED_FILE]: '用户上传文件',
                    [FileType.PARAMETER_IMAGE]: '参数图片'
                };
                return <Tag>{typeMap[record.fileType as FileType] || '未知类型'}</Tag>
            },
        },
        {
            title: '大小',
            key: 'size',
            width: 100,
            render: (_: unknown, record: any) => {
                const size = record.size;
                if (size < 1024) {
                    return `${size} B`;
                } else if (size < 1024 * 1024) {
                    return `${(size / 1024).toFixed(2)} KB`;
                } else if (size < 1024 * 1024 * 1024) {
                    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
                } else {
                    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
                }
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            render: (_: unknown, record: any) => (
                <div className="flex space-x-1">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleRenameClick(record)}
                        size="small"
                    />
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(record)}
                        size="small"
                    />
                    <Button
                        type="link"
                        icon={<ShareAltOutlined />}
                        onClick={() => handleShare(record)}
                        size="small"
                        title="复制下载链接"
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                        size="small"
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
            {!userId && (
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
            )}
            <div className="overflow-x-auto">
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
                        onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                        size: 'small',
                    }}
                    scroll={{ x: 'max-content' }}
                    size="small"
                />
            </div>

            <Modal
                title="重命名文件"
                open={renameModalVisible}
                onOk={handleRenameSubmit}
                onCancel={() => setRenameModalVisible(false)}
                destroyOnClose={true}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="baseName"
                        label="文件名"
                        rules={[
                            { required: true, message: '请输入文件名' },
                            { max: 255, message: '文件名不能超过255个字符' },
                            { 
                                pattern: /^[^\/\\:*?"<>|]+$/, 
                                message: '文件名不能包含以下字符: / \\ : * ? " < > |' 
                            }
                        ]}
                        extra={currentFile?.name.includes('.') ? `文件扩展名 ".${currentFile?.name.split('.').pop()}" 将被保留` : ''}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

// 添加 displayName 修复 lint 错误
FileList.displayName = 'FileList'; 