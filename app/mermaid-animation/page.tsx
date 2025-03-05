'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Tabs, Input, Slider, Space, Tooltip, Radio, Steps } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StepBackwardOutlined, 
  StepForwardOutlined, 
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined
} from '@ant-design/icons';
import MermaidRenderer from './MermaidRenderer';
import MermaidAnimation from './MermaidAnimation';
import MermaidDiffAnimation from './MermaidDiffAnimation';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Step } = Steps;

// 示例Mermaid代码
const exampleMermaidCodes = [
  `graph TD
    A[开始] --> B[步骤1]
    B --> C[步骤2]`,
  
  `graph TD
    A[开始] --> B[步骤1]
    B --> C[步骤2]
    C --> D[步骤3]`,
  
  `graph TD
    A[开始] --> B[步骤1]
    B --> C[步骤2]
    C --> D[步骤3]
    B --> E[分支1]
    D --> F[完成]
    E --> F`,
];

const AnimationPage = () => {
  const [mermaidCodes, setMermaidCodes] = useState<string[]>(exampleMermaidCodes);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2); // 播放速度（秒）
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [animationType, setAnimationType] = useState<'basic' | 'advanced'>('advanced');

  // 添加新的Mermaid代码
  const addNewStep = () => {
    const lastCode = mermaidCodes[mermaidCodes.length - 1];
    setMermaidCodes([...mermaidCodes, lastCode]);
  };

  // 删除特定步骤的Mermaid代码
  const deleteStep = (index: number) => {
    if (mermaidCodes.length <= 1) return;
    
    const newCodes = [...mermaidCodes];
    newCodes.splice(index, 1);
    setMermaidCodes(newCodes);
    
    if (currentStepIndex >= newCodes.length) {
      setCurrentStepIndex(newCodes.length - 1);
    }
  };

  // 更新特定步骤的Mermaid代码
  const updateMermaidCode = (index: number, newCode: string) => {
    const newCodes = [...mermaidCodes];
    newCodes[index] = newCode;
    setMermaidCodes(newCodes);
  };

  // 播放/暂停动画
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // 下一步
  const nextStep = () => {
    if (currentStepIndex < mermaidCodes.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  // 上一步
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // 动画播放逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStepIndex < mermaidCodes.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, playSpeed * 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, mermaidCodes, playSpeed]);

  // 渲染完成回调
  const handleRenderComplete = () => {
    console.log('渲染完成');
  };

  // 生成步骤说明
  const getStepTitle = (index: number) => {
    // 尝试从Mermaid代码中提取标题
    const code = mermaidCodes[index];
    const titleMatch = code.match(/title:?\s*(.*?)(?:\n|$)/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    return `步骤 ${index + 1}`;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mermaid动画演示</h1>
      
      <div className="mb-6 border-b pb-4">
        <h2 className="text-lg font-semibold mb-2">步骤导航</h2>
        <div className="mb-2 text-xs text-gray-600">
          点击任意步骤可直接切换到该步骤
        </div>
        <Steps 
          current={currentStepIndex} 
          onChange={setCurrentStepIndex}
          items={mermaidCodes.map((_, index) => ({
            title: getStepTitle(index),
            status: currentStepIndex === index 
              ? 'process' 
              : (currentStepIndex > index ? 'finish' : 'wait')
          }))}
          className="mb-2"
          type="navigation"
          size="small"
        />
      </div>
      
      <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
        <TabPane tab="编辑器" key="1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">步骤 {currentStepIndex + 1} / {mermaidCodes.length}</h2>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={addNewStep}
                    size="small"
                  >
                    添加步骤
                  </Button>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => deleteStep(currentStepIndex)}
                    disabled={mermaidCodes.length <= 1}
                    size="small"
                  >
                    删除当前步骤
                  </Button>
                </Space>
              </div>
              <TextArea
                rows={12}
                value={mermaidCodes[currentStepIndex]}
                onChange={(e) => updateMermaidCode(currentStepIndex, e.target.value)}
                placeholder="输入Mermaid代码"
                className="font-mono"
              />
              <div className="mt-4 text-xs text-gray-600">
                提示：可以在每个步骤的Mermaid代码中添加 title: 标题文本 来自定义步骤名称
              </div>
            </div>
            
            <div>
              <Card title="预览" className="h-full">
                <MermaidRenderer 
                  code={mermaidCodes[currentStepIndex]} 
                  className="w-full h-full" 
                />
              </Card>
            </div>
          </div>
        </TabPane>
        
        <TabPane tab="动画演示" key="2">
          <div className="w-full">
            <Card className="mb-4 min-h-[400px]">
              <div className="mb-4 flex justify-between items-center">
                <Radio.Group 
                  value={animationType} 
                  onChange={(e) => setAnimationType(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="basic">基础动画</Radio.Button>
                  <Radio.Button value="advanced">高级动画</Radio.Button>
                </Radio.Group>
                
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => setActiveTabKey("1")}
                >
                  编辑当前步骤
                </Button>
              </div>
              
              {animationType === 'basic' ? (
                <MermaidAnimation 
                  codes={mermaidCodes}
                  currentIndex={currentStepIndex}
                  className="w-full h-full"
                  transitionDuration={playSpeed / 2}
                />
              ) : (
                <MermaidDiffAnimation 
                  codes={mermaidCodes}
                  currentIndex={currentStepIndex}
                  className="w-full h-full"
                  transitionDuration={playSpeed / 2}
                  onRenderComplete={handleRenderComplete}
                />
              )}
            </Card>
            
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center items-center space-x-4">
                <Tooltip title="上一步">
                  <Button 
                    icon={<StepBackwardOutlined />} 
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                  />
                </Tooltip>
                
                <Button 
                  type="primary"
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={togglePlay}
                  disabled={mermaidCodes.length <= 1}
                >
                  {isPlaying ? '暂停' : '播放'}
                </Button>
                
                <Tooltip title="下一步">
                  <Button 
                    icon={<StepForwardOutlined />} 
                    onClick={nextStep}
                    disabled={currentStepIndex === mermaidCodes.length - 1}
                  />
                </Tooltip>
              </div>
              
              <div className="flex items-center space-x-4">
                <span>播放速度:</span>
                <Slider
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={playSpeed}
                  onChange={setPlaySpeed}
                  style={{ width: '200px' }}
                />
                <span>{playSpeed}秒/步骤</span>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={() => setCurrentStepIndex(0)}
                >
                  重置动画
                </Button>
              </div>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AnimationPage;
