'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Pagination, Tabs, ConfigProvider, Progress, Tooltip, Statistic, Row, Col } from 'antd';
import { trpc } from '@/utils/trpc/client';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined, HddOutlined, UserOutlined, CloudOutlined, KeyOutlined, SettingOutlined } from '@ant-design/icons';
import UserFilesModal from './components/UserFilesModal';
import { AdminRouteGuard } from '../components/AdminRouteGuard';
import { MainPageLayout } from '../components/MainPageLayout';
import { Card } from 'antd';
import SiteConfigManager from './components/SiteConfigManager';
import InvitationCodeManager from './components/InvitationCodeManager';
// 导入dayjs和中文语言包
import dayjs from 'dayjs';
import zhCN from 'antd/locale/zh_CN';
import { useI18n } from '../i18n-provider';

export default function AdminPage() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  const { t, locale } = useI18n();

  // 根据当前语言选择对应的Antd语言包
  const getAntdLocale = () => {
    if (locale === 'zh') return zhCN;
    // 如果需要其他语言支持，可以在这里添加
    return undefined; // 默认英文
  };

  const utils = trpc.useUtils();
  const { data, isLoading, refetch } = trpc.user.getUsers.useQuery({
    page: currentPage,
    pageSize,
    search: searchText,
  });
  
  // 获取最大存储空间配置
  const { data: maxStorageConfig } = trpc.config.getConfig.useQuery({
    key: 'user.storage.max'
  });
  
  const maxStorage = maxStorageConfig ? parseInt(maxStorageConfig.value) : 2147483648; // 默认2GB
  
  // 格式化存储大小显示函数
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

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
      message.success(t('admin.user_management.create_success', '用户创建成功'));
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
      message.success(t('admin.user_management.update_success', '用户更新成功'));
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
      message.success(t('admin.user_management.delete_success', '用户删除成功'));
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
      title: t('admin.user_management.confirm_delete_title', '确认删除'),
      content: t('admin.user_management.confirm_delete', '确定要删除此用户吗？'),
      okText: t('common.confirm', '确定'),
      cancelText: t('common.cancel', '取消'),
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
      title: t('admin.user_management.username', '用户名'),
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: t('admin.user_management.created_at', '创建时间'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: t('admin.user_management.is_admin', '管理员'),
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
          {isAdmin ? t('common.yes', '是') : t('common.no', '否')}
        </Button>
      ),
    },
    {
      title: t('admin.user_management.file_count', '文件数'),
      dataIndex: 'files',
      key: 'files',
      render: (files: any[]) => files.length,
    },
    {
      title: t('admin.user_management.storage_used', '存储空间使用'),
      key: 'storageUsed',
      sorter: (a: any, b: any) => Number(a.storageUsed) - Number(b.storageUsed),
      render: (_: any, record: any) => {
        const storageUsed = Number(record.storageUsed) || 0;
        const percentage = Math.min((storageUsed / maxStorage) * 100, 100);
        
        // 确定进度条状态
        const getProgressStatus = () => {
          if (percentage >= 90) return "exception";
          if (percentage >= 70) return "normal";
          return "success";
        };
        
        return (
          <Tooltip title={`${formatFileSize(storageUsed)} / ${formatFileSize(maxStorage)}`}>
            <div className="flex items-center space-x-2">
              <HddOutlined />
              <div className="flex-grow w-28">
                <Progress 
                  percent={parseFloat(percentage.toFixed(1))} 
                  size="small" 
                  status={getProgressStatus()}
                  format={() => formatFileSize(storageUsed)}
                />
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: t('admin.user_management.actions', '操作'),
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('common.edit', '编辑')}
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            {t('common.delete', '删除')}
          </Button>
          <Button
            type="link"
            icon={<FileOutlined />}
            onClick={() => handleViewFiles(record.id)}
          >
            {t('admin.user_management.view_files', '查看文件')}
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

  // 获取所有用户存储空间使用总量
  const { data: totalStorageUsed = 0 } = trpc.user.getTotalStorageUsed.useQuery();
  
  // 用户管理页面的标签页
  const tabItems = [
    {
      key: 'dashboard',
      label: (
        <span>
          <CloudOutlined />
          {t('admin.dashboard', '控制面板')}
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* 统计卡片 */}
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic 
                  title={t('dashboard.total_users', '用户总数')}
                  value={data?.total || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title={t('dashboard.storage_usage', '存储使用情况')}
                  value={data ? formatFileSize(totalStorageUsed) : '0 B'}
                  prefix={<HddOutlined />}
                />
              </Card>
            </Col>
          </Row>
          
          {/* 更多统计信息可以在这里添加 */}
        </div>
      ),
    },
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          {t('admin.users', '用户管理')}
        </span>
      ),
      children: (
        <div>
          <div className="mb-4 flex justify-between">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              {t('admin.user_management.create_user', '创建用户')}
            </Button>
            <Input.Search
              placeholder={t('admin.user_management.search_placeholder', '搜索用户名')}
              allowClear
              style={{ width: 200 }}
              onSearch={(value) => {
                setSearchText(value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Table
            dataSource={data?.users || []}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={false}
          />
          <div className="mt-4 flex justify-end">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={data?.total || 0}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              showTotal={(total) => t('admin.pagination_total', '共 {total} 条记录').replace('{total}', total.toString())}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'invitationCodes',
      label: (
        <span>
          <KeyOutlined />
          {t('admin.invitation_code.title', '邀请码管理')}
        </span>
      ),
      children: (
        <Card 
          title={t('admin.invitation_code.title', '邀请码管理')}
          extra={
            <div className="flex items-center">
              <span className="mr-2">{t('admin.invitation_code.require_for_registration', '需要邀请码注册')}：</span>
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
      label: (
        <span>
          <SettingOutlined />
          {t('admin.settings', '系统设置')}
        </span>
      ),
      children: (
        <Card title={t('admin.site_config.title', '站点配置')}>
          <SiteConfigManager />
        </Card>
      ),
    },
  ];

  return (
    <AdminRouteGuard>
      <ConfigProvider locale={getAntdLocale()}>
        <MainPageLayout>
          <Tabs 
            items={tabItems} 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            tabPosition="left"
            className="admin-tabs"
          />

          <Modal
            title={editingUser ? t('admin.user_management.edit_user', '编辑用户') : t('admin.user_management.create_user', '创建用户')}
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