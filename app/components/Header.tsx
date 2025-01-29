import { Avatar, Button, Dropdown, Menu, Modal, Upload, message } from 'antd';
import { SearchOutlined, SettingOutlined, UploadOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpc/client';
import { useState } from 'react';
import { FileType } from '@prisma/client';
import { MinioImage } from './MinioImage';
import { useMinioUpload } from '@/utils/minio/useMinioUpload';

const navItems = [
    { href: '/files', label: '文件' },
    { href: '/workflow/upload', label: '工作流' },
    { href: '/tasks', label: '任务列表' },
    { href: '/servers', label: '服务器' },
]

export function Header() {
    const router = useRouter();
    const { data: user, refetch: refetchUser } = trpc.auth.getCurrentUser.useQuery();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { uploadFile } = useMinioUpload({
        onSuccess: () => {
            setUploading(false);
        },
        onError: () => {
            setUploading(false);
            message.error('上传失败');
        }
    });

    const { mutateAsync: updateAvatar } = trpc.auth.updateAvatar.useMutation({
        onSuccess: () => {
            message.success('头像更新成功');
            refetchUser();
            setIsModalVisible(false);
        },
        onError: () => {
            message.error('头像更新失败');
        }
    });

    const handleAvatarUpload = async (file: File) => {
        try {
            setUploading(true);
            const pathName = await uploadFile(file, FileType.USER_UPLOADED_FILE);
            await updateAvatar({ avatarPath: pathName });
        } catch (error) {
            console.error('上传头像失败:', error);
            message.error('上传头像失败');
        } finally {
            setUploading(false);
        }
    };

    const menu = (
        <Menu>
            <Menu.Item key="avatar" onClick={() => setIsModalVisible(true)}>
                <UploadOutlined /> 更换头像
            </Menu.Item>
            <Menu.Item key="logout" onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
            }}>
                退出登录
            </Menu.Item>
        </Menu>
    );

    return (
        <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between mb-6">
            <div className="flex items-center space-x-8">
                <h1 className="text-xl font-semibold text-gray-800 select-none cursor-pointer" onClick={() => { router.push("/") }} >ComfXYZ 工作台</h1>
                <nav className="flex space-x-4">
                    {navItems.map(item => (
                        <Button key={item.href} type="text" onClick={() => router.push(item.href)}>
                            {item.label}
                        </Button>
                    ))}
                </nav>
            </div>
            <div className="flex items-center space-x-4">
                <Dropdown overlay={menu} trigger={['click']}>
                    <div className="flex items-center space-x-2 cursor-pointer">
                        {user && user.avatar ? (
                            <MinioImage
                                pathName={user.avatar}
                                width={32}
                                height={32}
                                className="rounded-full"
                                preview={false}
                            />
                        ) : (
                            <Avatar icon={<UserOutlined />} />
                        )}
                        <span className="text-gray-800">{user?.username}</span>
                    </div>
                </Dropdown>
            </div>

            <Modal
                title="更换头像"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Upload.Dragger
                    accept="image/*"
                    showUploadList={false}
                    customRequest={({ file }) => {
                        if (file instanceof File) {
                            handleAvatarUpload(file);
                        }
                    }}
                >
                    <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                    <p className="ant-upload-hint">支持 jpg、png 等常见图片格式</p>
                </Upload.Dragger>
                {uploading && <div className="text-center mt-4">上传中...</div>}
            </Modal>
        </header>
    );
}