import { Button, Select, Table, Tag, Tooltip, Modal, Input, Form } from 'antd';
import { DownloadOutlined, DeleteOutlined, EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { FileType } from '@prisma/client';
import { trpc } from '@/utils/trpc/client';
import { MinioImage } from './MinioImage';
import { MinioVideo } from './MinioVideo';
import { message } from 'antd';
import { useI18n } from '../i18n-provider';

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
    const { t } = useI18n();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedFileType, setSelectedFileType] = useState<FileType | undefined>(undefined);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [sharingPath, setSharingPath] = useState<string | null>(null);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [currentFile, setCurrentFile] = useState<any>(null);
    const [newFileName, setNewFileName] = useState('');
    const [form] = Form.useForm();
    const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
    const [previewVideoPath, setPreviewVideoPath] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

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

    // 获取文件URL用于下载
    const { data: fileUrl, isLoading: isLoadingUrl } = trpc.minio.getFileUrl.useQuery(
        { path: selectedPath || '' },
        { enabled: !!selectedPath }
    );

    // 获取文件URL用于分享
    const { data: shareUrl, isLoading: isLoadingShareUrl } = trpc.minio.getFileUrl.useQuery(
        { path: sharingPath || '' },
        { enabled: !!sharingPath }
    );

    // 处理文件下载
    useEffect(() => {
        if (selectedPath && fileUrl?.url && !isLoadingUrl) {
            window.open(fileUrl.url, '_blank');
            setSelectedPath(null);
        }
    }, [selectedPath, fileUrl, isLoadingUrl]);

    // 处理文件分享URL获取完成后的复制操作
    useEffect(() => {
        if (sharingPath && shareUrl?.url && !isLoadingShareUrl) {
            const copyToClipboard = async () => {
                try {
                    await navigator.clipboard.writeText(shareUrl.url);
                    message.success(t('common.success'));
                } catch (error) {
                    console.error('复制失败:', error);
                    message.error(t('common.error'));
                } finally {
                    setSharingPath(null);
                }
            };
            copyToClipboard();
        }
    }, [sharingPath, shareUrl, isLoadingShareUrl, t]);

    // 处理文件下载
    const handleDownload = async (file: any) => {
        try {
            setSelectedPath(null);
            await new Promise(resolve => setTimeout(resolve, 100));
            setSelectedPath(file.path);
        } catch (error) {
            console.error('获取文件URL失败:', error);
            message.error(t('errors.file.notFound'));
        }
    };

    // 处理文件删除
    const handleDelete = async (file: any) => {
        Modal.confirm({
            title: t('common.confirm_delete'),
            content: `${t('common.confirm_delete_file')} "${file.name}" ?`,
            okText: t('common.confirm'),
            cancelText: t('common.cancel'),
            onOk: async () => {
                try {
                    await deleteFileMutation({ id: file.id });
                    message.success(t('common.success'));
                    refetchFiles();
                    
                    // 触发存储空间变化事件
                    window.dispatchEvent(new Event('storageChanged'));
                } catch (error) {
                    console.error('删除文件失败:', error);
                    message.error(t('errors.file.deleteFailed'));
                }
            }
        });
    };

    // 处理文件重命名点击
    const handleRenameClick = (file: any) => {
        setCurrentFile(file);
        
        // 获取文件名（不包含扩展名）
        const fileNameParts = file.name.split('.');
        const baseName = fileNameParts.length > 1 
            ? fileNameParts.slice(0, -1).join('.')
            : file.name;
            
        form.setFieldsValue({ baseName });
        setRenameModalVisible(true);
    };

    // 处理文件重命名提交
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
                    message.success(t('common.file_list.rename_success'));
                    refetchFiles();
                }
            }
            setRenameModalVisible(false);
        } catch (error) {
            message.error(t('common.file_list.rename_failed'));
        }
    };

    // 处理文件类型变更
    const handleFileTypeChange = (value: FileType | undefined) => {
        setSelectedFileType(value);
        setPagination({ ...pagination, current: 1 });
    };

    // 处理文件分享（复制下载链接）
    const handleShare = async (file: any) => {
        setSharingPath(file.path);
    };

    // 处理视频预览
    const handleVideoPreview = (file: any) => {
        setPreviewVideoPath(file.path);
        setVideoPreviewVisible(true);
    };

    // 处理视频预览关闭
    const handleVideoPreviewClose = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
        setVideoPreviewVisible(false);
    };

    // 判断是否为视频文件
    const isVideoFile = (mimeType: string) => {
        return mimeType.startsWith('video/');
    };

    // 判断是否为图片文件
    const isImageFile = (mimeType: string) => {
        return mimeType.startsWith('image/');
    };

    // 响应式列配置
    const columns = [
        {
            title: t('admin.file_management.filename'),
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
            title: t('common.preview'),
            key: 'preview',
            width: 80,
            render: (_: unknown, record: any) => {
                if (isImageFile(record.type)) {
                    return (
                        <MinioImage
                            pathName={record.path}
                            width={40}
                            height={40}
                            preview={true}
                            className="object-cover"
                        />
                    );
                } else if (isVideoFile(record.type)) {
                    return (
                        <div className="cursor-pointer" onClick={() => handleVideoPreview(record)}>
                            <MinioVideo
                                pathName={record.path}
                                width={40}
                                height={40}
                                controls={false}
                                autoPlay={false}
                                muted={true}
                                className="object-cover"
                            />
                        </div>
                    );
                }
                return null;
            },
        },
        {
            title: t('admin.file_management.type'),
            key: 'fileType',
            width: 120,
            render:(_:unknown, record: any)=>{
                const typeMap: Record<FileType, string> = {
                    [FileType.AI_GENERATED_IMAGE]: t('common.file_list.ai_generated_images'),
                    [FileType.USER_UPLOADED_FILE]: t('common.file_list.user_uploaded_files'),
                    [FileType.PARAMETER_IMAGE]: t('common.file_list.parameter_images')
                };
                return <Tag>{typeMap[record.fileType as FileType] || '未知类型'}</Tag>
            },
        },
        {
            title: t('admin.file_management.size'),
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
            title: t('admin.file_management.actions'),
            key: 'action',
            width: 180,
            render: (_: unknown, record: any) => (
                <div className="flex space-x-1">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleRenameClick(record)}
                        size="small"
                        title={t('common.file_list.rename')}
                    />
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(record)}
                        size="small"
                        title={t('common.download')}
                    />
                    <Button
                        type="link"
                        icon={<ShareAltOutlined />}
                        onClick={() => handleShare(record)}
                        size="small"
                        title={t('common.file_list.share_link')}
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                        size="small"
                        title={t('common.delete')}
                    />
                </div>
            ),
        },
    ];

    const fileTypeOptions = [
        { label: t('common.file_list.all_files'), value: undefined },
        { label: t('common.file_list.ai_generated_images'), value: FileType.AI_GENERATED_IMAGE },
        { label: t('common.file_list.user_uploaded_files'), value: FileType.USER_UPLOADED_FILE },
        { label: t('common.file_list.parameter_images'), value: FileType.PARAMETER_IMAGE }
    ];

    return (
        <div className={className}>
            {!userId && (
                <div className="mb-4">
                    <Select
                        placeholder={t('common.file_list.select_file_type')}
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

            {/* 视频预览模态框 */}
            <Modal
                title={t('common.file_list.preview')}
                open={videoPreviewVisible}
                onCancel={handleVideoPreviewClose}
                footer={null}
                width={800}
                centered
            >
                {previewVideoPath && (
                    <div className="flex justify-center">
                        <MinioVideo
                            ref={videoRef}
                            pathName={previewVideoPath}
                            width="100%"
                            height="auto"
                            controls={true}
                            autoPlay={true}
                            className="max-h-[70vh]"
                        />
                    </div>
                )}
            </Modal>

            {/* 重命名模态框 */}
            <Modal
                title={t('common.file_list.rename')}
                open={renameModalVisible}
                onOk={handleRenameSubmit}
                onCancel={() => setRenameModalVisible(false)}
                destroyOnClose={true}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="baseName"
                        label={t('admin.file_management.filename')}
                        rules={[
                            { required: true, message: t('errors.file.name_required') },
                            { max: 255, message: t('errors.file.nameLength') },
                            { 
                                pattern: /^[^\/\\:*?"<>|]+$/, 
                                message: t('errors.file.name_invalid_chars') 
                            }
                        ]}
                        extra={currentFile?.name.includes('.') ? `${t('common.file_list.extension_preserved')} ".${currentFile?.name.split('.').pop()}"` : ''}
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