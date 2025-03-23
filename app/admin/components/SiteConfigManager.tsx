import { trpc } from '@/utils/trpc/client';
import React, { useState } from 'react';
import { Form, Input, Button, Table, Space, Popconfirm, message, Modal, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';

interface SiteConfig {
  id: number;
  key: string;
  value: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const predefinedKeys = [
  { key: 'site.title', description: '站点标题' },
  { key: 'site.description', description: '站点描述' },
  { key: 'site.footer.copyright', description: '页脚版权信息' },
  { key: 'site.footer.slogan', description: '页脚标语' },
  { key: 'site.logo.url', description: 'Logo图片在Minio中的路径' },
  { key: 'site.year', description: '版权年份' },
  { key: 'site.logo.url', description: '' },
  { key: 'user.storage.max', description: '用户最大网盘空间(字节)，默认2GB = 2147483648字节' },
];

export default function SiteConfigManager() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SiteConfig | null>(null);
  const [form] = Form.useForm();

  const utils = trpc.useUtils();
  const { data: configs, isLoading } = trpc.config.getAllConfigs.useQuery();
  const { mutate: updateConfig } = trpc.config.updateConfig.useMutation({
    onSuccess: () => {
      utils.config.getAllConfigs.invalidate();
      message.success('配置更新成功');
      setIsModalVisible(false);
    },
  });
  const { mutate: deleteConfig } = trpc.config.deleteConfig.useMutation({
    onSuccess: () => {
      utils.config.getAllConfigs.invalidate();
      message.success('配置删除成功');
    },
  });

  const showAddModal = () => {
    setEditingConfig(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record: SiteConfig) => {
    setEditingConfig(record);
    form.setFieldsValue({
      key: record.key,
      value: record.value,
      description: record.description || '',
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values: any) => {
    updateConfig({
      key: values.key,
      value: values.value,
      description: values.description,
    });
  };

  const columns = [
    {
      title: '配置键',
      dataIndex: 'key',
      key: 'key',
      ellipsis: true,
    },
    {
      title: '配置值',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: SiteConfig) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="确定要删除此配置吗?"
            onConfirm={() => deleteConfig({ key: record.key })}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const showPredefinedKeySelect = () => {
    Modal.info({
      title: '预定义配置键',
      content: (
        <div>
          <p>以下是系统预定义的配置键，点击可直接使用：</p>
          <ul className="mt-4">
            {predefinedKeys.map(item => (
              <li key={item.key} className="cursor-pointer text-blue-500 hover:text-blue-700 mb-2" onClick={() => {
                form.setFieldsValue({
                  key: item.key,
                  description: item.description,
                });
                Modal.destroyAll();
              }}>
                <div className="font-medium">{item.key}</div>
                <div className="text-gray-500 text-sm">{item.description}</div>
              </li>
            ))}
          </ul>
        </div>
      ),
      width: 500,
    });
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
        >
          添加配置
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={configs?.map(config => ({
          ...config,
          createdAt: config.createdAt.toISOString(),
          updatedAt: config.updatedAt.toISOString()
        }))}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingConfig ? '编辑配置' : '添加配置'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="key"
            label={
              <div className="flex items-center">
                <span>配置键</span>
                {!editingConfig && (
                  <Tooltip title="查看预定义配置键">
                    <QuestionCircleOutlined 
                      className="ml-2 text-blue-500 cursor-pointer" 
                      onClick={showPredefinedKeySelect}
                    />
                  </Tooltip>
                )}
              </div>
            }
            rules={[{ required: true, message: '请输入配置键' }]}
          >
            <Input placeholder="例如: site.title" disabled={!!editingConfig} />
          </Form.Item>

          <Form.Item
            name="value"
            label="配置值"
            rules={[{ required: true, message: '请输入配置值' }]}
          >
            <TextArea rows={3} placeholder="配置的值" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input placeholder="可选的配置描述" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Button className="mr-2" onClick={() => setIsModalVisible(false)}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 