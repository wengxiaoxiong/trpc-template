'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthDebugPage() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [clearSuccess, setClearSuccess] = useState<boolean>(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // 检索存储的token
        const token = localStorage.getItem('authToken');
        setAuthToken(token);
        
        // 如果有token，尝试解析
        if (token) {
          try {
            // 获取token的负载部分
            const payload = token.split('.')[1];
            const decodedPayload = atob(payload);
            const payloadData = JSON.parse(decodedPayload);
            setTokenDetails(payloadData);
          } catch (e) {
            console.error('无法解析token:', e);
            setTokenDetails({ error: '无法解析token' });
          }
        }
        
        // 检索用户数据
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setUserData(user);
          } catch (e) {
            console.error('无法解析用户数据:', e);
          }
        }
      } catch (err) {
        console.error('读取localStorage时出错:', err);
      }
    }
  }, []);
  
  const handleClearAuth = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setClearSuccess(true);
      setAuthToken(null);
      setTokenDetails(null);
      setUserData(null);
      
      setTimeout(() => {
        setClearSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('清除认证信息时出错:', err);
    }
  };
  
  const formatJSON = (data: any) => {
    return JSON.stringify(data, null, 2);
  };
  
  const goToLogin = () => {
    router.push('/login');
  };
  
  const goToTestPage = () => {
    router.push('/google-test');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">认证状态调试</h1>
      
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={goToLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          前往登录页
        </button>
        <button 
          onClick={goToTestPage}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          前往测试页
        </button>
        <button 
          onClick={handleClearAuth}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          清除认证信息
        </button>
      </div>
      
      {clearSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          认证信息已清除
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">认证状态</h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium w-32">登录状态:</span>
              <span className={authToken ? "text-green-500" : "text-red-500"}>
                {authToken ? "已登录" : "未登录"}
              </span>
            </div>
            
            <div className="flex">
              <span className="font-medium w-32">存储的Token:</span>
              <span className="break-all">
                {authToken 
                  ? `${authToken.substring(0, 15)}...${authToken.substring(authToken.length - 10)}` 
                  : "无"}
              </span>
            </div>
          </div>
        </div>
        
        {userData && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">用户信息</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
              {formatJSON(userData)}
            </pre>
          </div>
        )}
        
        {tokenDetails && (
          <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
            <h2 className="text-xl font-semibold mb-3">Token详情</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
              {formatJSON(tokenDetails)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-medium mb-2">调试说明</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>此页面显示存储在浏览器中的认证信息</li>
          <li>如果显示"已登录"但你仍无法访问受保护的页面，可能是token已过期或无效</li>
          <li>你可以点击"清除认证信息"来注销，然后重新登录</li>
          <li>点击"前往登录页"尝试重新登录，或点击"前往测试页"测试Google登录流程</li>
        </ul>
      </div>
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">调试提示：</h3>
        <p className="mb-2">如果您在登录时遇到问题，请检查：</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>localStorage中的'authToken'是否存在</li>
          <li>token是否有'正确的格式'</li>
          <li>token是否'尚未过期'（检查'exp'字段）</li>
          {/* 更多调试提示 */}
        </ol>
      </div>
    </div>
  );
} 