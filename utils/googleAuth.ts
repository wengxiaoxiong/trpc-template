/**
 * Google认证辅助工具
 * 提供用于处理Google OAuth流程的函数
 */

/**
 * 生成Google登录URL
 * @returns Google OAuth授权URL
 */
export function getGoogleAuthUrl(): string {
  // 如果不在浏览器环境，提前返回
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    
    // 确保与后端API和Google控制台配置完全相同的重定向URI
    // 这必须和Google Cloud Console中的配置以及后端route.ts中的配置完全匹配
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';
    
    // 检查必需参数
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('缺少 NEXT_PUBLIC_GOOGLE_CLIENT_ID 环境变量');
      throw new Error('Google客户端ID未配置');
    }
    
    const options: Record<string, string> = {
      redirect_uri: redirectUri,
      client_id: clientId,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    console.log('Google Auth URL选项:', {
      ...options,
      client_id: options.client_id ? options.client_id.substring(0, 8) + '...' : undefined,
    });
    
    const queryString = new URLSearchParams(options);
    const authUrl = `${rootUrl}?${queryString.toString()}`;
    console.log('生成的Google Auth URL:', authUrl);
    
    return authUrl;
  } catch (error) {
    console.error('生成Google认证URL出错:', error);
    throw error;
  }
}

/**
 * 使用授权码完成Google登录
 * @param code Google授权码
 * @returns 包含用户信息和令牌的响应
 */
export async function loginWithGoogle(code: string): Promise<any> {
  if (!code) {
    throw new Error('授权码不能为空');
  }

  try {
    console.log('开始使用授权码完成登录');
    
    // 发送授权码到后端API
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    console.log('收到API响应状态:', response.status);
    
    let data;
    try {
      data = await response.json();
    } catch (err) {
      console.error('解析响应JSON失败:', err);
      throw new Error('服务器返回了无效的响应格式');
    }
    
    if (!response.ok) {
      console.error('登录失败, 错误信息:', data);
      throw new Error(data.error || `服务器返回错误: ${response.status}`);
    }
    
    if (!data.token) {
      console.error('登录响应缺少token:', data);
      throw new Error('认证成功但未返回有效token');
    }
    
    console.log('登录成功, 响应数据:', {
      ...data,
      token: data.token ? data.token.substring(0, 10) + '...' : undefined,
    });
    
    return data;
  } catch (error) {
    console.error('Google登录请求失败:', error);
    throw error;
  }
} 