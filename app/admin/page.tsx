'use client';

import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Pagination } from 'antd';
import { trpc } from '@/utils/trpc/client';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import UserFilesModal from './components/UserFilesModal';
import { AdminRouteGuard } from '../components/AdminRouteGuard';
import { MainPageLayout } from '../components/MainPageLayout';
import { Card } from 'antd';

export default function AdminPage() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data, isLoading, refetch } = trpc.user.getUsers.useQuery({
    page: currentPage,
    pageSize,
    search: searchText,
  });

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
    setIsModalVisible(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser.mutateAsync({ id });
    } catch (error) {
      // 错误已经在 mutation 的 onError 中处理
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          ...values,
        });
      } else {
        await createUser.mutateAsync(values);
      }
    } catch (error) {
      // 错误已经在 mutation 的 onError 中处理
    }
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

  return (
    <AdminRouteGuard>
      <MainPageLayout>
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
    </AdminRouteGuard>
  );
} 