import { trpc } from '@/utils/trpc/client';
import { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  message, 
  Form, 
  InputNumber, 
  DatePicker, 
  Badge, 
  Tag, 
  Tooltip,
  Switch,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import { useI18n } from '@/app/i18n-provider';

interface InvitationCode {
  id: number;
  code: string;
  usedCount: number;
  maxUses: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  createdBy: number;
  users: Array<{id: number, username: string}>;
}

// 邀请码状态标签
const StatusTag = ({ code }: { code: InvitationCode }) => {
  const { t } = useI18n();
  
  if (!code.isActive) {
    return <Tag color="red">{t('admin.invitation_code.invitation_code_status.disabled', '已禁用')}</Tag>;
  }
  
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
    return <Tag color="orange">{t('admin.invitation_code.invitation_code_status.expired', '已过期')}</Tag>;
  }
  
  if (code.usedCount >= code.maxUses) {
    return <Tag color="purple">{t('admin.invitation_code.invitation_code_status.used_up', '已用完')}</Tag>;
  }
  
  return <Tag color="green">{t('admin.invitation_code.invitation_code_status.active', '有效')}</Tag>;
};

export default function InvitationCodeManager() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCode, setEditingCode] = useState<InvitationCode | null>(null);
  const [form] = Form.useForm();
  const { t } = useI18n();
  
  const utils = trpc.useUtils();
  const { data: codes, isLoading } = trpc.user.getAllInvitationCodes.useQuery();
  
  const { mutate: createCode } = trpc.user.createInvitationCode.useMutation({
    onSuccess: () => {
      message.success(t('admin.invitation_code.create_success', '邀请码创建成功'));
      setIsModalVisible(false);
      utils.user.getAllInvitationCodes.invalidate();
    },
    onError: (error) => {
      message.error(error.message);
    },
  });
  
  const { mutate: updateCode } = trpc.user.updateInvitationCode.useMutation({
    onSuccess: () => {
      message.success(t('admin.invitation_code.update_success', '邀请码更新成功'));
      setIsModalVisible(false);
      utils.user.getAllInvitationCodes.invalidate();
    },
    onError: (error) => {
      message.error(error.message);
    },
  });
  
  const { mutate: deleteCode } = trpc.user.deleteInvitationCode.useMutation({
    onSuccess: () => {
      message.success(t('admin.invitation_code.delete_success', '邀请码删除成功'));
      utils.user.getAllInvitationCodes.invalidate();
    },
    onError: (error) => {
      message.error(error.message);
    },
  });
  
  const showCreateModal = () => {
    setEditingCode(null);
    form.resetFields();
    form.setFieldsValue({
      maxUses: 1,
      expiresAt: null,
    });
    setIsModalVisible(true);
  };
  
  const showEditModal = (record: InvitationCode) => {
    setEditingCode(record);
    form.setFieldsValue({
      maxUses: record.maxUses,
      isActive: record.isActive,
      expiresAt: record.expiresAt ? dayjs(record.expiresAt) : null,
    });
    setIsModalVisible(true);
  };
  
  const handleSubmit = (values: any) => {
    if (editingCode) {
      updateCode({
        id: editingCode.id,
        maxUses: values.maxUses,
        isActive: values.isActive,
        expiresAt: values.expiresAt ? values.expiresAt.format() : null,
      });
    } else {
      createCode({
        maxUses: values.maxUses,
        expiresAt: values.expiresAt ? values.expiresAt.format() : null,
      });
    }
  };
  
  const columns: TableColumnsType<InvitationCode> = [
    {
      title: t('admin.invitation_code.code', '邀请码'),
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <span className="font-mono">{code}</span>
      ),
    },
    {
      title: t('admin.invitation_code.status', '状态'),
      key: 'status',
      render: (_: any, record: InvitationCode) => <StatusTag code={record} />,
    },
    {
      title: t('admin.invitation_code.usage', '使用情况'),
      key: 'usage',
      render: (_: any, record: InvitationCode) => (
        <span>
          {record.usedCount} / {record.maxUses}
        </span>
      ),
    },
    {
      title: t('admin.invitation_code.registered_users', '已注册用户'),
      key: 'users',
      render: (_: any, record: InvitationCode) => (
        <span>
          {record.users.length > 0 ? (
            <Tooltip 
              title={
                <div>
                  {record.users.map((user) => (
                    <div key={user.id}>{user.username}</div>
                  ))}
                </div>
              }
            >
              <Button type="link" icon={<InfoCircleOutlined />}>
                {record.users.length}
              </Button>
            </Tooltip>
          ) : (
            '0'
          )}
        </span>
      ),
    },
    {
      title: t('admin.invitation_code.expires_at', '过期时间'),
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: Date | null) => date ? new Date(date).toLocaleString() : t('admin.invitation_code.never_expires', '永不过期'),
    },
    {
      title: t('admin.invitation_code.created_at', '创建时间'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleString(),
    },
    {
      title: t('common.actions', '操作'),
      key: 'action',
      render: (_: any, record: InvitationCode) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            {t('common.edit', '编辑')}
          </Button>
          <Popconfirm
            title={t('admin.invitation_code.confirm_delete', '确定要删除此邀请码吗?')}
            onConfirm={() => deleteCode({ id: record.id })}
            okText={t('common.confirm', '确定')}
            cancelText={t('common.cancel', '取消')}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {t('common.delete', '删除')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <div className="flex justify-between mb-4">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showCreateModal}
        >
          {t('admin.invitation_code.generate', '生成邀请码')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={codes}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCode ? t('admin.invitation_code.edit', '编辑邀请码') : t('admin.invitation_code.create', '生成新邀请码')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {editingCode && (
            <Form.Item
              name="isActive"
              label={t('admin.invitation_code.is_active', '是否启用')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}

          <Form.Item
            name="maxUses"
            label={t('admin.invitation_code.max_uses', '最大使用次数')}
            rules={[{ required: true, message: t('admin.invitation_code.please_input_max_uses', '请输入最大使用次数') }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="expiresAt"
            label={t('admin.invitation_code.expires_at_optional', '过期时间 (可选)')}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm:ss" 
              style={{ width: '100%' }} 
              placeholder={t('admin.invitation_code.never_expires_if_not_set', '不设置则永不过期')}
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Button className="mr-2" onClick={() => setIsModalVisible(false)}>
              {t('common.cancel', '取消')}
            </Button>
            <Button type="primary" htmlType="submit">
              {editingCode ? t('common.update', '更新') : t('admin.invitation_code.generate', '生成')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 