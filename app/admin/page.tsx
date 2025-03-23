'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Pagination, Tabs, ConfigProvider } from 'antd';
import { trpc } from '@/utils/trpc/client';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import UserFilesModal from './components/UserFilesModal';
import { AdminRouteGuard } from '../components/AdminRouteGuard';
import { MainPageLayout } from '../components/MainPageLayout';
import { Card } from 'antd';
import SiteConfigManager from './components/SiteConfigManager';
import InvitationCodeManager from './components/InvitationCodeManager';
// 导入dayjs和中文语言包
import dayjs from 'dayjs';
import zhCN from 'antd/locale/zh_CN';

export default function AdminPage() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('users');

  const utils = trpc.useUtils();
  const { data, isLoading, refetch } = trpc.user.getUsers.useQuery({
    page: currentPage,
    pageSize,
    search: searchText,
  });

  // 监听tab切换，刷新对应数据
  useEffect(() => {
    // 刷新当前选中tab的数据
    if (activeTab === 'users') {
      refetch();
      utils.user.getUsers.invalidate();
    } else if (activeTab === 'invitationCodes') {
      utils.user.getAllInvitationCodes.invalidate();
      utils.user.getRequireInvitationCodeSetting.invalidate();
    } else if (activeTab === 'configs') {
      utils.config.getAllConfigs.invalidate();
    }
  }, [activeTab, utils, refetch]);

  const createUser = trpc.user.createUser.useMutation({
    onSuccess: () => {
      message.success('用户创建成功');
      setIsModalVisible(false);
      form.resetFields();
      utils.user.getUsers.invalidate();
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const updateUser = trpc.user.updateUser.useMutation({
    onSuccess: () => {
      message.success('用户更新成功');
      setIsModalVisible(false);
      form.resetFields();
      utils.user.getUsers.invalidate();
      refetch();
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const deleteUser = trpc.user.deleteUser.useMutation({
    onSuccess: () => {
      message.success('用户删除成功');
      utils.user.getUsers.invalidate();
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      isAdmin: false,
    });
    setIsModalVisible(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      isAdmin: user.isAdmin,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此用户吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        deleteUser.mutate({ id });
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingUser) {
        updateUser.mutate({
          id: editingUser.id,
          username: values.username,
          isAdmin: values.isAdmin,
        });
      } else {
        createUser.mutate({
          username: values.username,
          password: values.password,
          isAdmin: values.isAdmin,
        });
      }
    });
  };

  const handleViewFiles = (userId: number) => {
    setSelectedUserId(userId);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '管理员',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (isAdmin: boolean, record: any) => (
        <Button
          type={isAdmin ? 'primary' : 'default'}
          onClick={() => {
            updateUser.mutate({
              id: record.id,
              isAdmin: !isAdmin,
            });
          }}
        >
          {isAdmin ? '是' : '否'}
        </Button>
      ),
    },
    {
      title: '文件数',
      dataIndex: 'files',
      key: 'files',
      render: (files: any[]) => files.length,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
          <Button
            type="link"
            icon={<FileOutlined />}
            onClick={() => handleViewFiles(record.id)}
          >
            查看文件
          </Button>
        </Space>
      ),
    },
  ];

  // 注册配置管理
  const { data: requireInvitationCode, isLoading: isLoadingConfig } = 
    trpc.user.getRequireInvitationCodeSetting.useQuery();
  
  const { mutate: updateConfig } = trpc.config.updateConfig.useMutation({
    onSuccess: () => {
      message.success('配置更新成功');
      utils.user.getRequireInvitationCodeSetting.invalidate();
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const handleToggleInvitationCodeRequirement = (checked: boolean) => {
    updateConfig({
      key: 'registration.requireInvitationCode',
      value: checked ? 'true' : 'false',
      description: '是否需要邀请码注册'
    });
  };

  // 管理页面的标签页
  const tabItems = [
    {
      key: 'users',
      label: '用户管理',
      children: (
        <Card title="用户管理">
          <div className="mb-4 flex justify-between items-center">
            <Input.Search
              placeholder="搜索用户"
              style={{ width: 200 }}
              onSearch={setSearchText}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              创建用户
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={data?.users}
            loading={isLoading}
            rowKey="id"
            pagination={{
              total: data?.total,
              current: currentPage,
              pageSize: pageSize,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
          />
        </Card>
      ),
    },
    {
      key: 'invitationCodes',
      label: '邀请码管理',
      children: (
        <Card 
          title="邀请码管理"
          extra={
            <div className="flex items-center">
              <span className="mr-2">需要邀请码注册：</span>
              <Switch 
                checked={requireInvitationCode} 
                onChange={handleToggleInvitationCodeRequirement}
                loading={isLoadingConfig}
              />
            </div>
          }
        >
          <InvitationCodeManager />
        </Card>
      ),
    },
    {
      key: 'configs',
      label: '站点配置',
      children: (
        <Card title="站点配置">
          <SiteConfigManager />
        </Card>
      ),
    },
  ];

  return (
    <AdminRouteGuard>
      <ConfigProvider locale={zhCN}>
        <MainPageLayout>
          <Tabs 
            items={tabItems} 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            tabPosition="left"
            className="admin-tabs"
          />

          <Modal
            title={editingUser ? '编辑用户' : '创建用户'}
            open={isModalVisible}
            onOk={handleModalOk}
            onCancel={() => setIsModalVisible(false)}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input />
              </Form.Item>
              {!editingUser && (
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password />
                </Form.Item>
              )}
              <Form.Item
                name="isAdmin"
                label="管理员权限"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Form>
          </Modal>

          {selectedUserId && (
            <UserFilesModal
              userId={selectedUserId}
              visible={!!selectedUserId}
              onClose={() => setSelectedUserId(null)}
            />
          )}
        </MainPageLayout>
      </ConfigProvider>
    </AdminRouteGuard>
  );
} 