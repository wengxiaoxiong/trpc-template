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
import { useI18n } from '../i18n-provider';
import LanguageSwitcher from './LanguageSwitcher';
import { NotificationIcon } from './NotificationIcon';

const navItems = [
    { href: '/files', label: 'file_management' },
]

// 统一图标样式
const iconStyle = { fontSize: '16px' };

export function Header() {
    const router = useRouter();
    const { t, locale } = useI18n();
    const { data: user, refetch: refetchUser } = trpc.user.getCurrentUser.useQuery();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { logout } = useAuth();

    const { getConfigValue } = useSiteConfig();
  
    // 获取配置
    const siteTitle = getConfigValue('site.title', t('title'));

    const { uploadFile } = useMinioUpload({
        onSuccess: () => {
            setUploading(false);
        },
        onError: () => {
            setUploading(false);
            message.error(t('errors.file.uploadFailed'));
        }
    });

    const { mutateAsync: updateAvatar } = trpc.user.updateAvatar.useMutation({
        onSuccess: () => {
            message.success(t('common.success'));
            refetchUser();
            setIsModalVisible(false);
        },
        onError: () => {
            message.error(t('errors.file.uploadFailed'));
        }
    });

    const handleAvatarUpload = async (file: File) => {
        try {
            setUploading(true);
            const pathName = await uploadFile(file, FileType.USER_UPLOADED_FILE);
            await updateAvatar({ avatarPath: pathName });
        } catch (error) {
            console.error('上传头像失败:', error);
            message.error(t('errors.file.uploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    const menu = (
        <Menu>
            <Menu.Item key="avatar" onClick={() => setIsModalVisible(true)}>
                <UploadOutlined style={iconStyle} /> {t('common.change_avatar')}
            </Menu.Item>
            <Menu.Item key="logout" onClick={() => {
                logout();
            }}>
                <LogoutOutlined style={iconStyle} /> {t('common.logout')}
            </Menu.Item>
        </Menu>
    );
    
    const mobileNavItems = [
        ...navItems.map(item => ({ ...item, label: t(`header.${item.label}`) })),
        ...(user?.isAdmin ? [{ href: '/admin', label: t('header.admin') }] : []),
    ];

    return (
        <header className="bg-white sticky top-0 z-10 shadow-sm py-2 mb-4">
            <div className="container flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        className="lg:hidden text-gray-600 p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <MenuOutlined style={iconStyle} />
                    </button>
                    
                    <div 
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => router.push('/')}
                    >
                        <span className="text-xl font-bold text-gray-800">{siteTitle}</span>
                    </div>
                </div>
                
                <div className="hidden lg:flex items-center space-x-6">
                    {navItems.map((item, index) => (
                        <Button
                            key={index}
                            type="link"
                            className="text-gray-600 hover:text-indigo-600"
                            onClick={() => router.push(item.href)}
                        >
                            {t(`header.${item.label}`)}
                        </Button>
                    ))}
                    {user?.isAdmin && (
                        <Button
                            type="link"
                            className="text-gray-600 hover:text-indigo-600"
                            onClick={() => router.push('/admin')}
                        >
                            {t('header.admin')}
                        </Button>
                    )}
                </div>
                
                <div className="hidden lg:flex items-center space-x-6 mr-4">
                    {/* 语言切换器 */}
                    <LanguageSwitcher />
                    
                    {/* 通知图标 */}
                    <NotificationIcon />
                    
                    <Dropdown overlay={menu} trigger={['click']}>
                        <div className="flex items-center space-x-3 cursor-pointer p-1.5 hover:bg-gray-50 rounded-md">
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
                                    <Avatar icon={<UserOutlined style={iconStyle} />} size={36} />
                                )}
                            </div>
                            <span className="text-gray-800 font-medium">{user?.username}</span>
                        </div>
                    </Dropdown>
                </div>
                
                {/* 移动端导航菜单 */}
                <div className="lg:hidden flex items-center space-x-4">
                    <LanguageSwitcher />
                    <NotificationIcon />
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item key="avatar" onClick={() => setIsModalVisible(true)}>
                                    <UploadOutlined style={iconStyle} /> {t('common.change_avatar')}
                                </Menu.Item>
                                <Menu.Item key="logout" onClick={logout}>
                                    <LogoutOutlined style={iconStyle} /> {t('common.logout')}
                                </Menu.Item>
                            </Menu>
                        }
                        trigger={['click']}
                    >
                        <div className="cursor-pointer">
                            {user && user.avatar ? (
                                <MinioImage
                                    pathName={user.avatar}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                    preview={false}
                                />
                            ) : (
                                <Avatar icon={<UserOutlined style={iconStyle} />} size={32} />
                            )}
                        </div>
                    </Dropdown>
                </div>
            </div>
            
            {/* 移动端菜单展开 */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 mt-2 px-4 py-2">
                    <div className="flex flex-col space-y-2">
                        {mobileNavItems.map((item, index) => (
                            <Button
                                key={index}
                                type="link"
                                className="text-gray-600 hover:text-indigo-600 text-left pl-0"
                                onClick={() => {
                                    router.push(item.href);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <Modal
                title={t('common.change_avatar')}
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
                        <UploadOutlined style={{ ...iconStyle, fontSize: '24px' }} />
                    </p>
                    <p className="ant-upload-text">{t('common.upload_hint')}</p>
                    <p className="ant-upload-hint">{t('common.upload_format_hint')}</p>
                </Upload.Dragger>
                {uploading && <div className="text-center mt-4">{t('common.uploading')}</div>}
            </Modal>
        </header>
    );
}