'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, Card, Button, Slider, Space, Tooltip, Row, Col } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StepBackwardOutlined, 
  StepForwardOutlined,
  SaveOutlined,
  SettingOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { ReactFlowProvider, Node, Edge } from 'reactflow';
import FlowEditor from '../components/FlowEditor';
import FrameSequenceEditor from '../components/FrameSequenceEditor';
import AnimationDiffEngine from '../components/AnimationDiffEngine';

const { TabPane } = Tabs;

// 帧类型定义
interface Frame {
  id: string;
  nodes: Node[];
  edges: Edge[];
  name: string;
}

// 初始示例帧
const initialFrames: Frame[] = [
  {
    id: 'frame-1',
    name: '初始节点',
    nodes: [
      {
        id: 'node-1',
        type: 'default',
        position: { x: 250, y: 150 },
        data: { label: '开始' }
      }
    ],
    edges: []
  },
  {
    id: 'frame-2',
    name: '添加步骤1',
    nodes: [
      {
        id: 'node-1',
        type: 'default',
        position: { x: 150, y: 150 },
        data: { label: '开始' }
      },
      {
        id: 'node-2',
        type: 'default',
        position: { x: 350, y: 150 },
        data: { label: '步骤1' }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        animated: true
      }
    ]
  },
  {
    id: 'frame-3',
    name: '添加分支',
    nodes: [
      {
        id: 'node-1',
        type: 'default',
        position: { x: 150, y: 150 },
        data: { label: '开始' }
      },
      {
        id: 'node-2',
        type: 'default',
        position: { x: 350, y: 100 },
        data: { label: '步骤1' }
      },
      {
        id: 'node-3',
        type: 'default',
        position: { x: 350, y: 200 },
        data: { label: '步骤2' }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        animated: true
      },
      {
        id: 'edge-2',
        source: 'node-1',
        target: 'node-3',
        animated: true
      }
    ]
  }
];

const AnimationPage = () => {
  const [frames, setFrames] = useState<Frame[]>(initialFrames);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2); // 播放速度（秒）
  const [activeTabKey, setActiveTabKey] = useState('1');
  
  // 当前帧的节点和边
  const [currentNodes, setCurrentNodes] = useState<Node[]>(frames[0].nodes);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>(frames[0].edges);
  
  // 帧变更时更新当前节点和边
  useEffect(() => {
    if (frames[currentFrameIndex]) {
      setCurrentNodes(frames[currentFrameIndex].nodes);
      setCurrentEdges(frames[currentFrameIndex].edges);
    }
  }, [currentFrameIndex, frames]);
  
  // 编辑器内容变更时更新当前帧
  const handleFlowChange = () => {
    const updatedFrames = [...frames];
    updatedFrames[currentFrameIndex] = {
      ...updatedFrames[currentFrameIndex],
      nodes: currentNodes,
      edges: currentEdges
    };
    setFrames(updatedFrames);
  };
  
  // 播放/暂停动画
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // 下一步
  const nextStep = () => {
    if (currentFrameIndex < frames.length - 1) {
      setCurrentFrameIndex(currentFrameIndex + 1);
    }
  };
  
  // 上一步
  const prevStep = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex(currentFrameIndex - 1);
    }
  };
  
  // 动画播放逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentFrameIndex < frames.length - 1) {
          setCurrentFrameIndex(currentFrameIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, playSpeed * 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentFrameIndex, frames, playSpeed]);
  
  return (
    <ReactFlowProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">流程图动画编辑器</h1>
        
        <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
          <TabPane tab="编辑器" key="1">
            <div className="mb-4">
              <FrameSequenceEditor 
                frames={frames}
                setFrames={setFrames}
                currentFrameIndex={currentFrameIndex}
                setCurrentFrameIndex={setCurrentFrameIndex}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Card title={`编辑帧: ${frames[currentFrameIndex]?.name || `帧 ${currentFrameIndex + 1}`}`} className="mb-4">
                <FlowEditor 
                  nodes={currentNodes}
                  setNodes={setCurrentNodes}
                  edges={currentEdges}
                  setEdges={setCurrentEdges}
                  onFlowChange={handleFlowChange}
                />
              </Card>
            </div>
          </TabPane>
          
          <TabPane tab="动画预览" key="2">
            <Card className="mb-4">
              <AnimationDiffEngine 
                frames={frames}
                currentFrameIndex={currentFrameIndex}
                transitionDuration={playSpeed / 2}
              />
              
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-center items-center space-x-4 mb-4">
                  <Button 
                    icon={<StepBackwardOutlined />} 
                    onClick={prevStep}
                    disabled={currentFrameIndex === 0}
                  />
                  <Button 
                    type="primary"
                    shape="circle"
                    icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={togglePlay}
                    size="large"
                  />
                  <Button 
                    icon={<StepForwardOutlined />} 
                    onClick={nextStep}
                    disabled={currentFrameIndex === frames.length - 1}
                  />
                </div>
                
                <Row align="middle" justify="center">
                  <Col span={16}>
                    <div className="flex items-center space-x-2">
                      <span>速度:</span>
                      <Slider 
                        min={0.5}
                        max={5}
                        step={0.5}
                        value={playSpeed}
                        onChange={value => setPlaySpeed(value)}
                        className="flex-1"
                      />
                      <span>{playSpeed}秒</span>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </TabPane>
          
          <TabPane tab="导出与分享" key="3">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">导出选项</h3>
                  <Space direction="vertical" className="w-full">
                    <Button icon={<ExportOutlined />} block>导出为MP4视频</Button>
                    <Button icon={<ExportOutlined />} block>导出为GIF动画</Button>
                    <Button icon={<SaveOutlined />} block>保存为项目文件</Button>
                    <Button icon={<SettingOutlined />} type="primary" block>
                      高级设置
                    </Button>
                  </Space>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">导出设置</h3>
                  <Card size="small">
                    <p className="text-gray-500 text-sm">
                      在此处可以配置导出设置，如分辨率、帧率等。功能开发中...
                    </p>
                  </Card>
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </ReactFlowProvider>
  );
};

export default AnimationPage;

