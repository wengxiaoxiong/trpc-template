'use client'

import React, { useState } from 'react';
import { Button, Input, Table, Tag, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined, CloudServerOutlined, SettingOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import * as echarts from 'echarts';
import { useAuth } from './auth/AuthProvider';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('features');

  interface DataType {
    key: string;
    name: string;
    description: string;
    status: string;
    createTime: string;
    updateTime: string;
  }

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      '初始化': '#6B7280',
      '运行中': '#3B82F6',
      '成功': '#10B981',
      '失败': '#EF4444'
    };
    return statusMap[status] || '#6B7280';
  };

  const { user } =useAuth()

  const columns: ColumnsType<DataType> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="rounded-full px-3 py-1">
          {status}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <div className="flex space-x-2">
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} className="text-gray-500 hover:text-blue-500" />
          </Tooltip>
          <Tooltip title="删除">
            <Button type="text" icon={<DeleteOutlined />} className="text-gray-500 hover:text-red-500" />
          </Tooltip>
        </div>
      ),
    },
  ];

  const data: DataType[] = [
    {
      key: '1',
      name: '人物肖像特征模板',
      description: '用于生成各类人物肖像的特征参数集合',
      status: '成功',
      createTime: '2024-01-15 14:30',
      updateTime: '2024-01-15 16:45',
    },
    {
      key: '2',
      name: '风景图片特征模板',
      description: '适用于生成自然风景图片的特征参数',
      status: '运行中',
      createTime: '2024-01-14 09:20',
      updateTime: '2024-01-15 10:30',
    },
    {
      key: '3',
      name: '动漫角色特征模板',
      description: '针对二次元动漫角色生成的特征集',
      status: '初始化',
      createTime: '2024-01-13 16:15',
      updateTime: '2024-01-14 11:25',
    },
    {
      key: '4',
      name: '建筑设计特征模板',
      description: '现代建筑风格的特征参数配置',
      status: '失败',
      createTime: '2024-01-12 13:40',
      updateTime: '2024-01-13 15:50',
    },
  ];

  const serverData = [
    {
      key: '1',
      name: '主力渲染服务器',
      address: 'http://192.168.1.100:7860',
      status: '在线',
      createTime: '2024-01-10 09:00',
      updateTime: '2024-01-15 16:30',
    },
    {
      key: '2',
      name: '备用渲染节点1',
      address: 'http://192.168.1.101:7860',
      status: '离线',
      createTime: '2024-01-11 10:20',
      updateTime: '2024-01-15 15:45',
    },
  ];

  const workflowData = [
    {
      key: '1',
      name: '标准人像生成流程',
      description: '针对人像照片的标准处理工作流',
      status: '运行中',
      createTime: '2024-01-14 11:30',
      updateTime: '2024-01-15 13:20',
    },
    {
      key: '2',
      name: '风景图优化流程',
      description: '自然风景图片的优化处理工作流',
      status: '成功',
      createTime: '2024-01-13 14:25',
      updateTime: '2024-01-15 09:15',
    },
  ];

  const taskData = [
    {
      key: '1',
      name: '批量人像渲染任务',
      description: '使用高清人像模板进行批量渲染',
      status: '运行中',
      createTime: '2024-01-15 10:00',
      updateTime: '2024-01-15 16:30',
    },
    {
      key: '2',
      name: '风景图片生成任务',
      description: '基于新风景模板的批量生成任务',
      status: '成功',
      createTime: '2024-01-14 15:40',
      updateTime: '2024-01-15 12:20',
    },
  ];

  const getTabData = () => {
    switch (activeTab) {
      case 'features':
        return data;
      case 'servers':
        return serverData;
      case 'workflows':
        return workflowData;
      case 'tasks':
        return taskData;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* 顶部导航 */}
        <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between mb-6">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-semibold text-gray-800">ComfXYZ 工作台</h1>
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="搜索特征、任务、工作流..."
              className="w-64 text-sm"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button type="text" icon={<SettingOutlined />} className="text-gray-500" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                A
              </div>
              <span className="text-gray-700">{user?.username}</span>
            </div>
          </div>
        </header>

        {/* 主要内容区 */}
        <main className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">特征模板</p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">24</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <i className="fas fa-layer-group text-blue-500"></i>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">服务器节点</p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">8</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <CloudServerOutlined className="text-xl text-indigo-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">工作流</p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">16</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <i className="fas fa-sitemap text-green-500"></i>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">运行任务</p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">32</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <i className="fas fa-tasks text-purple-500"></i>
                </div>
              </div>
            </div>
          </div>

          {/* 标签页导航 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-6">
                {[
                  { key: 'features', label: '特征模板' },
                  { key: 'servers', label: '服务器节点' },
                  { key: 'workflows', label: '工作流' },
                  { key: 'tasks', label: '任务' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 px-2 font-medium text-sm relative ${
                      activeTab === tab.key
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 列表内容 */}
            <div className="p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">
                  {activeTab === 'features' && '特征模板列表'}
                  {activeTab === 'servers' && '服务器节点列表'}
                  {activeTab === 'workflows' && '工作流列表'}
                  {activeTab === 'tasks' && '任务列表'}
                </h2>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="!rounded-button bg-gradient-to-r from-blue-500 to-indigo-600 border-none hover:opacity-90"
                >
                  新建
                </Button>
              </div>
              <Table
                columns={columns}
                dataSource={getTabData() as DataType[]}
                pagination={{
                  total: 100,
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                className="border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

