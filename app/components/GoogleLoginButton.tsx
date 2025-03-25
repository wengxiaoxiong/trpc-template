'use client';

import React, { useEffect, useState } from 'react';
import { getGoogleAuthUrl, loginWithGoogle } from '@/utils/googleAuth';
import { useRouter, useSearchParams } from 'next/navigation';

// 添加全局状态，防止重复处理同一个授权码
let isProcessingAuthCode = false;
let processedAuthCodes = new Set<string>();

interface GoogleLoginButtonProps {
  onLoginSuccess?: (data: any) => void;
  onLoginError?: (error: Error) => void;
  buttonText?: string;
  className?: string;
  disableAutoLogin?: boolean;
}

export default function GoogleLoginButton({
  onLoginSuccess,
  onLoginError,
  buttonText = '使用Google登录',
  className = '',
  disableAutoLogin = false,
}: GoogleLoginButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // 添加调试信息
  const addDebugInfo = (info: string) => {
    console.log(`GoogleLoginButton - ${info}`);
    setDebugInfo(prev => `${prev}\n${new Date().toLocaleTimeString()}: ${info}`);
  };

  // 处理URL中的授权码和错误
  useEffect(() => {
    addDebugInfo(`组件初始化，disableAutoLogin=${disableAutoLogin}`);
    
    // 如果禁用自动登录，则不处理授权码
    if (disableAutoLogin) {
      addDebugInfo('自动登录已禁用，不处理授权码');
      return;
    }

    try {
      const code = searchParams?.get('code');
      const errorParam = searchParams?.get('error');

      addDebugInfo(`检查URL参数: code=${code ? '有值' : '无'}, error=${errorParam ? '有值' : '无'}`);

      // 清除URL参数，避免刷新页面时重复处理
      const cleanupUrl = () => {
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          url.searchParams.delete('error');
          window.history.replaceState({}, document.title, url.toString());
          addDebugInfo('已清除URL参数');
        } catch (err) {
          console.error('清除URL参数错误:', err);
          addDebugInfo(`清除URL参数错误: ${err instanceof Error ? err.message : '未知错误'}`);
        }
      };

      if (errorParam) {
        const decodedError = decodeURIComponent(errorParam);
        setError(decodedError);
        addDebugInfo(`处理错误参数: ${decodedError}`);
        cleanupUrl();
        onLoginError?.(new Error(decodedError));
      } else if (code) {
        // 检查是否已经在处理这个授权码或之前处理过
        if (isProcessingAuthCode || processedAuthCodes.has(code)) {
          addDebugInfo(`跳过重复的授权码处理: ${code.substring(0, 10)}...`);
          return;
        }
        
        // 标记正在处理
        isProcessingAuthCode = true;
        processedAuthCodes.add(code);
        
        setIsLoading(true);
        addDebugInfo(`开始处理授权码: ${code.substring(0, 10)}...`);
        
        loginWithGoogle(code)
          .then((data) => {
            addDebugInfo('登录成功');
            setIsLoading(false);
            onLoginSuccess?.(data);
            // 成功后可以存储token到localStorage
            if (data.token) {
              try {
                localStorage.setItem('authToken', data.token);
                addDebugInfo('Token已保存到localStorage');
                // 可以添加自动重定向
                addDebugInfo('登录完成，如需重定向请在onLoginSuccess中处理');
              } catch (err) {
                console.warn('无法存储token到localStorage:', err);
                addDebugInfo(`无法存储token: ${err instanceof Error ? err.message : '未知错误'}`);
              }
            } else {
              addDebugInfo('登录响应中没有token');
            }
          })
          .catch((err) => {
            console.error('GoogleLoginButton - 登录失败:', err);
            addDebugInfo(`登录失败: ${err instanceof Error ? err.message : '未知错误'}`);
            setIsLoading(false);
            const errorMessage = err instanceof Error ? err.message : '登录失败';
            setError(errorMessage);
            onLoginError?.(err instanceof Error ? err : new Error(errorMessage));
          })
          .finally(() => {
            // 处理完成后释放标志
            isProcessingAuthCode = false;
            cleanupUrl();
          });
      } else {
        addDebugInfo('URL中没有授权码或错误参数');
      }
    } catch (err) {
      console.error('处理授权码时出错:', err);
      addDebugInfo(`处理授权码时出错: ${err instanceof Error ? err.message : '未知错误'}`);
      setError('处理登录请求时发生错误');
      setIsLoading(false);
      isProcessingAuthCode = false; // 确保错误情况下也释放标志
    }
  }, [searchParams, router, onLoginSuccess, onLoginError, disableAutoLogin]);

  const handleGoogleLogin = () => {
    try {
      // 清除旧的错误
      setError(null);
      setIsLoading(true);
      addDebugInfo('开始Google登录流程');
      
      // 获取Google认证URL
      const authUrl = getGoogleAuthUrl();
      addDebugInfo(`获取到认证URL: ${authUrl.substring(0, 30)}...`);
      
      // 跳转到Google认证页面
      addDebugInfo('正在跳转到Google认证页面...');
      window.location.href = authUrl;
    } catch (err) {
      console.error('启动Google登录时出错:', err);
      addDebugInfo(`启动登录出错: ${err instanceof Error ? err.message : '未知错误'}`);
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : '无法启动登录';
      setError(errorMessage);
      onLoginError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  // 添加调试模式切换
  const toggleDebug = (e: React.MouseEvent) => {
    e.preventDefault();
    const debugElem = document.getElementById('google-login-debug');
    if (debugElem) {
      debugElem.style.display = debugElem.style.display === 'none' ? 'block' : 'none';
    }
  };

  return (
    <div>
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 disabled:opacity-50 ${className}`}
        aria-label="使用Google登录"
      >
        {isLoading ? (
          <span>加载中...</span>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="24px"
              height="24px"
              aria-hidden="true"
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
            <span>{buttonText}</span>
          </>
        )}
      </button>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      
      {/* 调试信息区域，默认隐藏 */}
      <div className="mt-2 text-xs">
        <a href="#" onClick={toggleDebug} className="text-gray-500 hover:text-gray-700">调试信息</a>
        <pre id="google-login-debug" className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40" style={{display: 'none'}}>
          {debugInfo || '无调试信息'}
        </pre>
      </div>
    </div>
  );
} 