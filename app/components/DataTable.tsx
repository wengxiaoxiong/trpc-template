import { Table, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { ColumnsType } from 'antd/es/table';
import { StatusTag } from './StatusTag';

interface DataTableProps {
  activeTab: string;
  data: any[];
  columns: ColumnsType<any>;
}

export const DataTable = ({ activeTab, data, columns }: DataTableProps) => {
  const router = useRouter();

  return (
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
          onClick={() => router.push('/upload_workflow')}
        >
          新建
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          total: 100,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        className="border border-gray-200 rounded-lg"
      />
    </div>
  );
};