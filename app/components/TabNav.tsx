interface TabNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
  }
  
  export const TabNav = ({ activeTab, setActiveTab }: TabNavProps) => {
    return (
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
    );
  };