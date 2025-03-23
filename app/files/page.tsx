'use client'
import { MainPageLayout } from "@/app/components/MainPageLayout"
import { trpc } from "@/utils/trpc/client"
import { useState, useRef } from "react";
import { Upload, message, Card, Button, List, Space, Tag } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { InboxOutlined, DeleteOutlined, CheckCircleOutlined, FileOutlined } from '@ant-design/icons';
import { FileList, FileListRef } from "../components/FileList";
import { FileType } from "@prisma/client";

const { Dragger } = Upload;

export default function FilesPage() {
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
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
                            name: file.name,
                            size: file.size,
                            fileType: FileType.USER_UPLOADED_FILE,
                            description: '通过文件管理页面上传的文件'
                        }
                    )
                    message.success(`${file.name} 文件上传成功`);
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
                                            <Button 
                                                key="delete" 
                                                type="text" 
                                                danger 
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeFile(item.uid)}
                                                size="small"
                                            />
                                        ]}
                                    >
                                        <div className="flex items-center w-full">
                                            <FileOutlined className="mr-2 text-blue-500" />
                                            <div className="truncate flex-1">
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-gray-500 text-xs">
                                                    {item.size && `${(item.size / 1024).toFixed(1)} KB`} 
                                                    {item.type && <Tag className="ml-2" color="blue">{item.type.split('/')[1]}</Tag>}
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
        </MainPageLayout>
    );
}