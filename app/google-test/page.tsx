'use client';

import React, { useState, useEffect } from 'react';
import { getGoogleAuthUrl, loginWithGoogle } from '@/utils/googleAuth';

export default function GoogleTestPage() {
  const [authUrl, setAuthUrl] = useState<string>('');
  const [code, setCode] = useState<string | null>(null);
  const [loginStatus, setLoginStatus] = useState<string>('等待点击');
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // 初始化时生成Auth URL
  useEffect(() => {
    try {
      // 防止渲染时出错
      if (typeof window !== 'undefined') {
        const url = getGoogleAuthUrl();
        setAuthUrl(url);
      }
    } catch (err) {
      console.error('生成授权URL错误:', err);
      setError(`生成授权URL错误: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  }, []);

  // 检查URL参数中的code
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('code');
        if (codeParam) {
          setCode(codeParam);
          setLoginStatus('收到授权码，准备登录...');
        }

        const errorParam = urlParams.get('error');
        if (errorParam) {
          setError(decodeURIComponent(errorParam));
        }
      }
    } catch (err) {
      console.error('解析URL参数错误:', err);
    }
  }, []);

  // 当有code时自动登录
  useEffect(() => {
    if (code) {
      setLoginStatus('正在登录...');
      loginWithGoogle(code)
        .then(data => {
          setLoginStatus('登录成功');
          setUserData(data);
          try {
            // 清除URL参数
            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, document.title, url.toString());
          } catch (err) {
            console.error('清除URL参数错误:', err);
          }
        })
        .catch(err => {
          setLoginStatus('登录失败');
          setError(err.message || '未知登录错误');
          console.error('登录失败:', err);
        });
    }
  }, [code]);

  const handleLoginClick = () => {
    try {
      setLoginStatus('正在跳转到Google...');
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        setError('授权URL未生成，无法跳转');
      }
    } catch (err) {
      setError(`跳转错误: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Google 登录测试页面</h1>
      
      <div className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div className="border-b pb-4">
          <h2 className="font-semibold mb-2">状态</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-600">授权URL:</div>
            <div className="break-all">{authUrl ? (authUrl.length > 70 ? authUrl.substring(0, 70) + '...' : authUrl) : '未生成'}</div>
            
            <div className="text-gray-600">授权码:</div>
            <div>{code ? `${code.substring(0, 10)}...` : '无'}</div>
            
            <div className="text-gray-600">登录状态:</div>
            <div className={`${loginStatus.includes('成功') ? 'text-green-500' : loginStatus.includes('失败') ? 'text-red-500' : 'text-blue-500'} font-medium`}>
              {loginStatus}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="border-b pb-4">
            <h2 className="font-semibold mb-2 text-red-500">错误信息</h2>
            <pre className="bg-red-50 p-3 rounded text-red-600 text-sm whitespace-pre-wrap overflow-auto">
              {error}
            </pre>
          </div>
        )}
        
        {userData && (
          <div className="border-b pb-4">
            <h2 className="font-semibold mb-2 text-green-500">登录成功</h2>
            <div className="bg-green-50 p-3 rounded">
              <h3 className="font-medium">用户信息:</h3>
              <pre className="text-sm whitespace-pre-wrap mt-2 overflow-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="pt-4">
          <button
            onClick={handleLoginClick}
            disabled={loginStatus === '正在跳转到Google...' || !authUrl}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="24px"
              height="24px"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            <span>{loginStatus === '正在跳转到Google...' ? '正在跳转...' : '使用Google登录'}</span>
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-medium mb-2">常见错误及解决方法</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>控制台显示 <code className="bg-gray-100 px-1 py-0.5 rounded">404 (Not Found)</code> 错误：这是因为某些默认接口未实现，可以忽略</li>
          <li>如果看到 <code className="bg-gray-100 px-1 py-0.5 rounded">redirect_uri_mismatch</code>：请确保Google控制台中设置的重定向URI与代码中使用的完全一致</li>
          <li>如果显示 <code className="bg-gray-100 px-1 py-0.5 rounded">Invalid JSON</code>：这可能是某些框架产生的错误，不影响主要功能</li>
        </ul>
        
        <h3 className="font-medium mt-4 mb-2">重要提示</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>请确保Google控制台中设置了正确的重定向URI: <code className="bg-gray-100 px-1 py-0.5 rounded">http://localhost:3000/api/auth/google/callback</code></li>
          <li>前端和后端的重定向URI必须完全匹配</li>
        </ul>
      </div>
    </div>
  );
} 