import { Button, Image, Select, Table } from 'antd';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { FileType } from '@prisma/client';

interface FileListProps {
    fileListData: any;
    onDownload: (file: any) => void;
    onDelete: (file: any) => void;
    onPaginationChange: (pagination: any) => void;
    pagination: {
        current: number;
        pageSize: number;
    };
    // FileType.AI_GENERATED_IMAGE, FileType.USER_UPLOADED_FILE, FileType.PARAMETER_IMAGE
    selectedFileType: FileType | undefined
    onFileTypeChange: (value: FileType | undefined) => void;
}

export const FileList: React.FC<FileListProps> = ({
    fileListData,
    onDownload,
    onDelete,
    onPaginationChange,
    pagination,
    selectedFileType,
    onFileTypeChange
}) => {
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
                            src={record.url}
                            preview={{
                                src: record.url,
                            }}
                        />
                    </>
                )
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: any) => (
                <div className="space-x-2">
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => onDownload(record)}
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(record)}
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
        <div>
            <div className="mb-4">
                <Select
                    placeholder="选择文件类型"
                    style={{ width: 200 }}
                    options={fileTypeOptions}
                    value={selectedFileType}
                    onChange={onFileTypeChange}
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
                    pageSizeOptions: ['10', '20', '50', '100']
                }}
                onChange={onPaginationChange}
            />
        </div>
    );
}; 