'use client';

import React, { useState } from 'react';
import { 
  RobotOutlined, 
  UserOutlined, 
  LineChartOutlined, 
  LinkOutlined,
  ShoppingOutlined,
  CommentOutlined,
  FireOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { Message, WebSource, SkuItem, UserCommentNLP } from '../types';
import ConceptCard from './ConceptCard';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState<boolean>(false);

  const toggleSection = (section: string) => {
    if (expandAll) {
      setExpandAll(false);
    }
    
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
    if (expandAll) {
      setExpandedSection(null);
    }
  };

  const isSectionExpanded = (section: string) => {
    return expandAll || expandedSection === section;
  };

  const renderKeywords = () => {
    if (!message.dataSources?.keywords?.length) return null;
    
    return (
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-gray-50 rounded p-1"
          onClick={() => toggleSection('keywords')}
        >
          <FireOutlined className="text-orange-500 mr-2 text-xs" />
          <span className="text-xs font-medium">热点词汇</span>
          {isSectionExpanded('keywords') ? (
            <CaretUpOutlined className="text-gray-400 ml-1 text-xs" />
          ) : (
            <CaretDownOutlined className="text-gray-400 ml-1 text-xs" />
          )}
        </div>
        
        {isSectionExpanded('keywords') && (
          <div className="flex flex-wrap gap-1 mt-1 ml-5">
            {message.dataSources.keywords.map((keyword, idx) => (
              <span 
                key={idx} 
                className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600 cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => {/* 点击事件, 如复制或搜索等 */}}
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMarketTrends = () => {
    const trends = message.dataSources?.marketTrends;
    if (!trends) return null;
    
    return (
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-gray-50 rounded p-1"
          onClick={() => toggleSection('trends')}
        >
          <LineChartOutlined className="text-blue-500 mr-2 text-xs" />
          <span className="text-xs font-medium">市场趋势</span>
          {isSectionExpanded('trends') ? (
            <CaretUpOutlined className="text-gray-400 ml-1 text-xs" />
          ) : (
            <CaretDownOutlined className="text-gray-400 ml-1 text-xs" />
          )}
        </div>
        
        {isSectionExpanded('trends') && (
          <div className="ml-5 mt-1 bg-blue-50 rounded-md p-2">
            <div className="text-xs text-blue-700">
              <div className="flex justify-between">
                <span>品类: {trends.category}</span>
                <span>
                  {trends.trendDirection === 'up' && <CaretUpOutlined className="text-green-500" />}
                  {trends.trendDirection === 'down' && <CaretDownOutlined className="text-red-500" />}
                  增长率: {trends.growth}
                </span>
              </div>
              {trends.periodChange && (
                <div className="text-xs text-gray-600 mt-1">
                  {trends.periodChange}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWebSources = () => {
    const sources = message.dataSources?.webSources;
    if (!sources?.length) return null;
    
    return (
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-gray-50 rounded p-1"
          onClick={() => toggleSection('webSources')}
        >
          <LinkOutlined className="text-purple-500 mr-2 text-xs" />
          <span className="text-xs font-medium">参考网页</span>
          <span className="text-xs text-gray-400 ml-1">({sources.length})</span>
          {isSectionExpanded('webSources') ? (
            <CaretUpOutlined className="text-gray-400 ml-1 text-xs" />
          ) : (
            <CaretDownOutlined className="text-gray-400 ml-1 text-xs" />
          )}
        </div>
        
        {isSectionExpanded('webSources') && (
          <div className="ml-5 mt-1 space-y-2">
            {sources.map((source: WebSource, idx: number) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-md p-2 hover:border-purple-300 transition-colors">
                <div className="flex items-center">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs font-medium text-purple-600 hover:underline truncate flex-1"
                  >
                    {source.title}
                  </a>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{source.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSkuList = () => {
    const skus = message.dataSources?.skuList;
    if (!skus?.length) return null;
    
    return (
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-gray-50 rounded p-1"
          onClick={() => toggleSection('skuList')}
        >
          <ShoppingOutlined className="text-green-500 mr-2 text-xs" />
          <span className="text-xs font-medium">相关产品</span>
          <span className="text-xs text-gray-400 ml-1">({skus.length})</span>
          {isSectionExpanded('skuList') ? (
            <CaretUpOutlined className="text-gray-400 ml-1 text-xs" />
          ) : (
            <CaretDownOutlined className="text-gray-400 ml-1 text-xs" />
          )}
        </div>
        
        {isSectionExpanded('skuList') && (
          <div className="ml-5 mt-1 grid grid-cols-2 gap-2">
            {skus.map((sku: SkuItem, idx: number) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-md p-2 hover:border-green-300 transition-colors flex items-center">
                {sku.image && (
                  <div className="w-10 h-10 mr-2 flex-shrink-0">
                    <img src={sku.image} alt={sku.name} className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-800 truncate">{sku.name}</div>
                  {sku.brandName && <div className="text-xs text-gray-500">{sku.brandName}</div>}
                  {sku.price && <div className="text-xs text-green-600">¥{sku.price.toFixed(2)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderUserComments = () => {
    const comments = message.dataSources?.userCommentAnalysis;
    if (!comments?.length) return null;
    
    return (
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-gray-50 rounded p-1"
          onClick={() => toggleSection('userComments')}
        >
          <CommentOutlined className="text-yellow-500 mr-2 text-xs" />
          <span className="text-xs font-medium">用户评论分析</span>
          {isSectionExpanded('userComments') ? (
            <CaretUpOutlined className="text-gray-400 ml-1 text-xs" />
          ) : (
            <CaretDownOutlined className="text-gray-400 ml-1 text-xs" />
          )}
        </div>
        
        {isSectionExpanded('userComments') && (
          <div className="ml-5 mt-1 space-y-2">
            {comments.map((comment: UserCommentNLP, idx: number) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-md p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">{comment.aspect}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    comment.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                    comment.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {comment.sentiment === 'positive' ? '正面' : 
                     comment.sentiment === 'negative' ? '负面' : '中性'}
                    {comment.percentage && ` (${comment.percentage}%)`}
                  </span>
                </div>
                {comment.examples && comment.examples.length > 0 && (
                  <div className="mt-1 text-xs text-gray-600 italic line-clamp-2">
                    {'"' + comment.examples[0] + '"'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 渲染思考链路
  const renderThoughtProcess = () => {
    const thoughts = message.thoughtProcess;
    if (!thoughts?.length) return null;
    
    return (
      <div className="mb-2">
        <div 
          className="flex items-center cursor-pointer hover:bg-gray-50 rounded p-1"
          onClick={() => toggleSection('thoughtProcess')}
        >
          <BulbOutlined className="text-amber-500 mr-2 text-xs" />
          <span className="text-xs font-medium">思考链路</span>
          {isSectionExpanded('thoughtProcess') ? (
            <CaretUpOutlined className="text-gray-400 ml-1 text-xs" />
          ) : (
            <CaretDownOutlined className="text-gray-400 ml-1 text-xs" />
          )}
        </div>
        
        {isSectionExpanded('thoughtProcess') && (
          <div className="ml-5 mt-1 space-y-2">
            {thoughts.map((thought, idx) => (
              <div key={idx} className="bg-amber-50 border border-amber-100 rounded-md p-2">
                <div className="flex items-start">
                  <span className="text-amber-600 font-medium text-xs mr-2">{idx + 1}.</span>
                  <p className="text-xs text-gray-700">{thought}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 检查是否有数据来源可以展示
  const hasDataSources = () => {
    const ds = message.dataSources;
    if (!ds) return false;
    
    return (
      (ds.keywords && ds.keywords.length > 0) ||
      ds.marketTrends ||
      (ds.webSources && ds.webSources.length > 0) ||
      (ds.skuList && ds.skuList.length > 0) ||
      (ds.userCommentAnalysis && ds.userCommentAnalysis.length > 0)
    );
  };

  // 检查是否有思考链路或数据来源可以展示
  const hasSupplementaryData = () => {
    return hasDataSources() || (message.thoughtProcess && message.thoughtProcess.length > 0);
  };

  return (
    <div className={`flex mb-4 ${message.type === 'bot' ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex ${message.type === 'bot' ? 'flex-row' : 'flex-row-reverse'} max-w-[80%]`}>
        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${message.type === 'bot' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'} flex-shrink-0`}>
          {message.type === 'bot' ? <RobotOutlined /> : <UserOutlined />}
        </div>
        <div className={`mx-2 ${message.type === 'bot' ? 'order-last' : 'order-first'}`}>
          <div className={`px-4 py-2 rounded-lg ${message.type === 'bot' ? 'bg-white border border-gray-200' : 'bg-green-50 border border-green-200'}`}>
            {message.conceptData ? (
              <ConceptCard concept={message.conceptData} isInChat={true} />
            ) : (
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
          
          {message.type === 'bot' && hasSupplementaryData() && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg p-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600">辅助信息</span>
                <button 
                  onClick={toggleExpandAll}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  {expandAll ? (
                    <>
                      <ShrinkOutlined className="mr-1" />
                      收起全部
                    </>
                  ) : (
                    <>
                      <ExpandAltOutlined className="mr-1" />
                      展开全部
                    </>
                  )}
                </button>
              </div>
              
              {renderThoughtProcess()}
              {renderKeywords()}
              {renderMarketTrends()}
              {renderWebSources()}
              {renderSkuList()}
              {renderUserComments()}
            </div>
          )}
          
          <div className="text-xs text-gray-400 mt-1 text-right">
            {message.timestamp}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 