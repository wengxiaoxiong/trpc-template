import { Input, Button, Dropdown, Menu } from 'antd';
import { SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthProvider';
import { useRouter } from 'next/navigation';

export const Header = () => {
    const { user, logout } = useAuth();
    const router = useRouter();

    const menu = (
        <Menu>
            <Menu.Item key="logout" onClick={logout}>
                退出登录
            </Menu.Item>
        </Menu>
    );

    return (
        <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between mb-6">
            <div className="flex items-center space-x-8">
                <h1 className="text-xl font-semibold text-gray-800" onClick={() => { router.push("/") }} >ComfXYZ 工作台</h1>
                <Input
                    prefix={<SearchOutlined className="text-gray-400" />}
                    placeholder="搜索特征、任务、工作流..."
                    className="w-64 text-sm"
                />
            </div>
            <div className="flex items-center space-x-4">
                {/* <Button type="text" icon={<SettingOutlined />} className="text-gray-500" /> */}
                <Dropdown overlay={menu} trigger={['click']}>
                    <div className="flex items-center space-x-2 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                            {/* {user?.avatar ? (
                                <img src={user.avatar} alt="用户头像" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span>{user?.username?.charAt(0).toUpperCase()}</span>
                            )} */}
                            <span>{user?.username?.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-gray-700">{user?.username}</span>
                    </div>
                </Dropdown>
            </div>
        </header>
    );
};