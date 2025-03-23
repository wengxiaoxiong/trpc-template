'use client'
import { MainPageLayout } from "@/app/components/MainPageLayout"
import { trpc } from "@/utils/trpc/client"
import { useState, useRef } from "react";
import { Upload, message, Card, Button, List, Space, Tag, Input, Tooltip, Modal } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { InboxOutlined, DeleteOutlined, CheckCircleOutlined, FileOutlined, EditOutlined } from '@ant-design/icons';
import { FileList, FileListRef } from "../components/FileList";
import { FileType } from "@prisma/client";

const { Dragger } = Upload;

export default function FilesPage() {
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [editFileId, setEditFileId] = useState<string | null>(null);
    const [newFileName, setNewFileName] = useState<string>('');
    const utils = trpc.useUtils();
    const fileListRef = useRef<FileListRef>(null);
    
    const {
        mutateAsync: createFileMutation,
    } = trpc.minio.createFile.useMutation();

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: true,
        fileList,
        beforeUpload: (file) => {
            const newFile: UploadFile = {
                uid: crypto.randomUUID(),
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'done',
                percent: 100,
                originFileObj: file,
            };
            setFileList((prev) => [...prev, newFile]);
            return false; // 阻止自动上传
        },
        onRemove: (file) => {
            setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
        },
        showUploadList: false,
    };

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning('请先选择要上传的文件');
            return;
        }

        setUploading(true);
        
        for (const uploadFile of fileList) {
            try {
                const file = uploadFile.originFileObj as File;
                
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
                    body: file,
                    headers: {
                        'Content-Type': file.type || 'application/octet-stream',
                    }
                });

                if (response.ok) {
                    await createFileMutation(
                        {
                            path: newCredentials.pathName,
                            type: file.type || 'application/octet-stream',
                            name: uploadFile.name, // 使用可能已修改的文件名
                            size: file.size,
                            fileType: FileType.USER_UPLOADED_FILE,
                            description: '通过文件管理页面上传的文件'
                        }
                    )
                    message.success(`${uploadFile.name} 文件上传成功`);
                } else {
                    throw new Error('上传失败');
                }
            } catch (error) {
                message.error(`${uploadFile.name} ${(error as Error).message || '文件上传失败'}`);
            }
        }
        
        // 上传完成后清空文件列表并刷新文件列表
        setFileList([]);
        fileListRef.current?.refetchFiles();
        setUploading(false);
    };

    const clearFileList = () => {
        setFileList([]);
    };

    const removeFile = (uid: string) => {
        setFileList((prev) => prev.filter((item) => item.uid !== uid));
    };

    const handleEditFileName = (file: UploadFile) => {
        setEditFileId(file.uid);
        setNewFileName(file.name);
    };

    const saveFileName = () => {
        if (!editFileId || !newFileName.trim()) {
            setEditFileId(null);
            return;
        }

        setFileList((prev) => 
            prev.map((item) => {
                if (item.uid === editFileId) {
                    // 保持文件扩展名
                    const oldExt = item.name.split('.').pop() || '';
                    const baseName = newFileName.includes('.') ? newFileName : `${newFileName}.${oldExt}`;
                    return { ...item, name: baseName };
                }
                return item;
            })
        );
        setEditFileId(null);
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
                        <p className="ant-upload-hint">支持单个或批量上传，选择后点击"开始上传"按钮</p>
                    </Dragger>
                    
                    {fileList.length > 0 && (
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-medium">待上传文件 ({fileList.length})</div>
                                <Button size="small" onClick={clearFileList}>清空</Button>
                            </div>
                            <List
                                size="small"
                                bordered
                                dataSource={fileList}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Tooltip key="edit" title="修改文件名">
                                                <Button 
                                                    type="text" 
                                                    icon={<EditOutlined />}
                                                    onClick={() => handleEditFileName(item)}
                                                    size="small"
                                                />
                                            </Tooltip>,
                                            <Tooltip key="delete" title="删除">
                                                <Button 
                                                    type="text" 
                                                    danger 
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeFile(item.uid)}
                                                    size="small"
                                                />
                                            </Tooltip>
                                        ]}
                                    >
                                        <div className="flex items-center w-full">
                                            {item.type?.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(item.originFileObj as File)}
                                                    alt="预览"
                                                    className="w-8 h-8 object-cover mr-2 rounded"
                                                />
                                            ) : (
                                                <FileOutlined className="mr-2 text-blue-500" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{item.name}</div>
                                                <div className="text-gray-500 text-xs flex items-center">
                                                    <span>{item.size && `${(item.size / 1024).toFixed(1)} KB`}</span>
                                                    {item.type && (
                                                        <Tag className="ml-2 hidden sm:inline-block" color="blue">
                                                            {item.type.split('/')[1]}
                                                        </Tag>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                                className="max-h-40 overflow-auto"
                            />
                            <div className="mt-4 flex justify-end space-x-2">
                                <Button 
                                    type="primary" 
                                    onClick={handleUpload} 
                                    loading={uploading} 
                                    icon={<CheckCircleOutlined />}
                                >
                                    开始上传
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {uploading && <div className="text-gray-600 mt-4">上传中...</div>}
                </Card>

                <Card title="文件列表" className="w-full">
                    <FileList 
                        ref={fileListRef}
                    />
                </Card>
            </div>

            <Modal
                title="修改文件名"
                open={!!editFileId}
                onOk={saveFileName}
                onCancel={() => setEditFileId(null)}
                okText="确定"
                cancelText="取消"
            >
                <Input
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="请输入新的文件名"
                    autoFocus
                />
                <div className="text-gray-500 text-xs mt-2">
                    注意：系统将自动保留原文件扩展名，确保文件类型正确
                </div>
            </Modal>
        </MainPageLayout>
    );
}