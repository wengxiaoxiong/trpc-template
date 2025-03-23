import { Avatar, Button, Dropdown, Menu, Modal, Upload, message } from 'antd';
import { SearchOutlined, SettingOutlined, UploadOutlined, UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpc/client';
import { useState } from 'react';
import { FileType } from '@prisma/client';
import { MinioImage } from './MinioImage';
import { useMinioUpload } from '@/utils/minio/useMinioUpload';
import { useSiteConfig } from './SiteConfigProvider';

const navItems = [
    { href: '/files', label: '文件管理' },
]

export function Header() {
    const router = useRouter();
    const { data: user, refetch: refetchUser } = trpc.user.getCurrentUser.useQuery();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { logout } = useAuth();

    const { getConfigValue } = useSiteConfig();
  
    // 获取配置
    const siteTitle = getConfigValue('site.title', '模版项目');

    const { uploadFile } = useMinioUpload({
        onSuccess: () => {
            setUploading(false);
        },
        onError: () => {
            setUploading(false);
            message.error('上传失败');
        }
    });

    const { mutateAsync: updateAvatar } = trpc.user.updateAvatar.useMutation({
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
                logout();
            }}>
                退出登录
            </Menu.Item>
        </Menu>
    );
    
    const mobileNavItems = [
        ...navItems,
        ...(user?.isAdmin ? [{ href: '/admin', label: '管理后台' }] : []),
    ];

    return (
        <header className="bg-white shadow-sm py-4 px-4 sm:px-6 flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center justify-between w-full lg:w-auto">
                <h1 className="text-xl font-semibold text-gray-800 select-none cursor-pointer" onClick={() => { router.push("/webapp") }} >{siteTitle}</h1>
                <button 
                    className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none" 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="打开菜单"
                >
                    <MenuOutlined className="text-gray-700 text-xl" />
                </button>
            </div>
            
            {/* 桌面导航 */}
            <nav className="hidden lg:flex lg:space-x-4">
                {navItems.map(item => (
                    <Button key={item.href} type="text" onClick={() => router.push(item.href)}>
                        {item.label}
                    </Button>
                ))}
                {user?.isAdmin && (
                    <Button type="text" onClick={() => router.push('/admin')}>
                        管理后台
                    </Button>
                )}
            </nav>
            
            {/* 用户信息（桌面） */}
            <div className="hidden lg:flex items-center space-x-4">
                <Dropdown overlay={menu} trigger={['click']}>
                    <div className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-gray-50 rounded-md">
                        <div className="flex-shrink-0">
                            {user && user.avatar ? (
                                <MinioImage
                                    pathName={user.avatar}
                                    width={36}
                                    height={36}
                                    className="rounded-full"
                                    preview={false}
                                />
                            ) : (
                                <Avatar icon={<UserOutlined />} size={36} />
                            )}
                        </div>
                        <span className="text-gray-800 font-medium">{user?.username}</span>
                    </div>
                </Dropdown>
            </div>
            
            {/* 移动端导航菜单 */}
            {mobileMenuOpen && (
                <div className="w-full lg:hidden mt-4 py-3 border-t border-gray-200">
                    <div className="flex flex-col space-y-3">
                        {mobileNavItems.map(item => (
                            <Button 
                                key={item.href} 
                                type="text" 
                                block 
                                className="text-left" 
                                onClick={() => {
                                    router.push(item.href);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                        <div className="border-t border-gray-100 pt-3">
                            <div className="flex items-center px-2 py-2 mb-3">
                                <div className="flex-shrink-0 mr-3">
                                    {user && user.avatar ? (
                                        <MinioImage
                                            pathName={user.avatar}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                            preview={false}
                                        />
                                    ) : (
                                        <Avatar icon={<UserOutlined />} size={40} />
                                    )}
                                </div>
                                <span className="text-gray-800 text-lg">{user?.username}</span>
                            </div>
                            <Button 
                                block 
                                type="text" 
                                className="text-left py-2 my-1" 
                                onClick={() => setIsModalVisible(true)}
                            >
                                <UploadOutlined className="mr-2" /> 更换头像
                            </Button>
                            <Button 
                                block 
                                type="text" 
                                className="text-left py-2 my-1 text-red-500" 
                                onClick={() => {
                                    logout();
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <LogoutOutlined className="mr-2" /> 退出登录
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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