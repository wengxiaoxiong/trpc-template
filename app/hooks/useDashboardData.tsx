import { useCallback, useState } from "react";
import { StatusTag } from "../components/StatusTag";
import { ColumnsType } from "antd/es/table";
import { Button, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

export interface DataType {
    key: string;
    name: string;
    description: string;
    status: string;
    createTime: string;
    updateTime: string;
  }
  
export const useDashboardData = () => {
    const [activeTab, setActiveTab] = useState('features');


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
            <StatusTag status={status}/>
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
  
    const getTabData = useCallback(() => {
      switch (activeTab) {
        case 'features': return data;
        case 'servers': return serverData;
        case 'workflows': return workflowData;
        case 'tasks': return taskData;
        default: return [];
      }
    }, [activeTab]);
  
    return {
      activeTab,
      setActiveTab,
      getTabData,
      columns,
      // 其他需要暴露的数据
    };
  };