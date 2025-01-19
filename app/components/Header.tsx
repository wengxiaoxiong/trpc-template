import { Input, Button, Dropdown, Menu, Upload, message } from 'antd';
import { SearchOutlined, SettingOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useMinioUpload } from '@/utils/minio/useMinioUpload';
import { useState } from 'react';

const navItems = [
    { href: '/files', label: '文件' },
    { href: '/workflow/upload', label: '工作流' },
    { href: '/tasks', label: '任务列表' },
]

export const Header = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { uploadFile } = useMinioUpload({
        onSuccess: (pathName) => {
            message.success(`头像上传成功: ${pathName}`);
            // 这里可以更新用户信息，保存头像路径
        },
        onError: (error) => {
            message.error(`头像上传失败: ${error.message}`);
        },
    });

    const handleUploadAvatar = async (file: File) => {
        setLoading(true);
        try {
            await uploadFile(file);
        } finally {
            setLoading(false);
        }
    };

    const menu = (
        <Menu>
            <Menu.Item key="upload" onClick={() => document.getElementById('avatarUpload')?.click()}>
                <UploadOutlined /> 上传头像
                <input
                    id="avatarUpload"
                    type="file"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files) {
                            handleUploadAvatar(e.target.files[0]);
                        }
                    }}
                />
            </Menu.Item>
            <Menu.Item key="logout" onClick={logout}>
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                            <span>{user?.username?.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-gray-700">{user?.username}</span>
                    </div>
                </Dropdown>
            </div>
        </header>
    );
};