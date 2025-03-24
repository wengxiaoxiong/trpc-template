import { trpc } from '@/utils/trpc/client';
import React, { useState } from 'react';
import { Form, Input, Button, Table, Space, Popconfirm, message, Modal, Tooltip, Select } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { useI18n } from '@/app/i18n-provider';

interface SiteConfig {
  id: number;
  key: string;
  value: string;
  description: string | null;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export default function SiteConfigManager() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SiteConfig | null>(null);
  const [form] = Form.useForm();
  const { locale, t } = useI18n();
  const [currentLocale, setCurrentLocale] = useState(locale);

  const predefinedKeys = [
    { key: 'site.title', description: t('admin.site_config.predefined.site_title', '站点标题') },
    { key: 'site.description', description: t('admin.site_config.predefined.site_description', '站点描述') },
    { key: 'site.footer.copyright', description: t('admin.site_config.predefined.footer_copyright', '页脚版权信息') },
    { key: 'site.footer.slogan', description: t('admin.site_config.predefined.footer_slogan', '页脚标语') },
    { key: 'site.logo.url', description: t('admin.site_config.predefined.logo_url', 'Logo图片在Minio中的路径') },
    { key: 'site.year', description: t('admin.site_config.predefined.year', '版权年份') },
    { key: 'user.storage.max', description: t('admin.site_config.predefined.max_storage', '用户最大网盘空间(字节)，默认2GB = 2147483648字节') },
  ];

  const utils = trpc.useUtils();
  const { data: configs, isLoading } = trpc.config.getAllConfigs.useQuery({
    locale: currentLocale
  });
  const { mutate: updateConfig } = trpc.config.updateConfig.useMutation({
    onSuccess: () => {
      utils.config.getAllConfigs.invalidate();
      message.success(t('admin.site_config.update_success', '配置更新成功'));
      setIsModalVisible(false);
    },
  });
  const { mutate: deleteConfig } = trpc.config.deleteConfig.useMutation({
    onSuccess: () => {
      utils.config.getAllConfigs.invalidate();
      message.success(t('admin.site_config.delete_success', '配置删除成功'));
    },
  });

  const showAddModal = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({ locale: currentLocale });
    setIsModalVisible(true);
  };

  const showEditModal = (record: SiteConfig) => {
    setEditingConfig(record);
    form.setFieldsValue({
      key: record.key,
      value: record.value,
      description: record.description || '',
      locale: record.locale
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values: any) => {
    updateConfig({
      key: values.key,
      value: values.value,
      description: values.description,
      locale: values.locale
    });
  };

  const handleLocaleChange = (newLocale: string) => {
    setCurrentLocale(newLocale);
  };

  const columns = [
    {
      title: t('admin.site_config.key', '配置键'),
      dataIndex: 'key',
      key: 'key',
      ellipsis: true,
    },
    {
      title: t('admin.site_config.value', '配置值'),
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
    },
    {
      title: t('admin.site_config.locale', '语言'),
      dataIndex: 'locale',
      key: 'locale',
      width: 80,
    },
    {
      title: t('admin.site_config.description', '描述'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('common.actions', '操作'),
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
            title={t('admin.site_config.confirm_delete', '确定要删除此配置吗?')}
            onConfirm={() => deleteConfig({ key: record.key, locale: record.locale })}
            okText={t('common.confirm', '确定')}
            cancelText={t('common.cancel', '取消')}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const showPredefinedKeySelect = () => {
    Modal.info({
      title: t('admin.site_config.predefined_keys', '预定义配置键'),
      content: (
        <div>
          <p>{t('admin.site_config.predefined_keys_tip', '以下是系统预定义的配置键，点击可直接使用：')}</p>
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
        <div className="flex items-center gap-4">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
          >
            {t('admin.site_config.add_config', '添加配置')}
          </Button>
          
          <Select
            value={currentLocale}
            onChange={handleLocaleChange}
            style={{ width: 120 }}
            options={[
              { value: 'zh', label: t('languages.zh', '中文') },
              { value: 'en', label: t('languages.en', 'English') },
              { value: 'ja', label: t('languages.ja', '日本語') },
            ]}
          />
        </div>
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
        title={editingConfig ? t('admin.site_config.edit_config', '编辑配置') : t('admin.site_config.add_config', '添加配置')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ locale: currentLocale }}
        >
          <Form.Item
            name="key"
            label={
              <div className="flex items-center">
                <span>{t('admin.site_config.key', '配置键')}</span>
                {!editingConfig && (
                  <Tooltip title={t('admin.site_config.view_predefined_keys', '查看预定义配置键')}>
                    <QuestionCircleOutlined 
                      className="ml-2 text-blue-500 cursor-pointer" 
                      onClick={showPredefinedKeySelect}
                    />
                  </Tooltip>
                )}
              </div>
            }
            rules={[{ required: true, message: t('admin.site_config.please_input_key', '请输入配置键') }]}
          >
            <Input placeholder={t('admin.site_config.key_placeholder', '例如: site.title')} disabled={!!editingConfig} />
          </Form.Item>

          <Form.Item
            name="locale"
            label={t('admin.site_config.locale', '语言')}
            rules={[{ required: true, message: t('admin.site_config.please_select_locale', '请选择语言') }]}
          >
            <Select
              options={[
                { value: 'zh', label: t('languages.zh', '中文') },
                { value: 'en', label: t('languages.en', 'English') },
                { value: 'ja', label: t('languages.ja', '日本語') },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="value"
            label={t('admin.site_config.value', '配置值')}
            rules={[{ required: true, message: t('admin.site_config.please_input_value', '请输入配置值') }]}
          >
            <TextArea rows={3} placeholder={t('admin.site_config.value_placeholder', '配置的值')} />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('admin.site_config.description', '描述')}
          >
            <Input placeholder={t('admin.site_config.description_placeholder', '可选的配置描述')} />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end">
              <Button type="default" onClick={() => setIsModalVisible(false)} className="mr-2">
                {t('common.cancel', '取消')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('common.save', '保存')}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 