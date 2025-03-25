import { NextResponse } from 'next/server'
import { prisma } from '@/utils/prisma'
import { generateToken } from '@/utils/jwt'
import { google } from 'googleapis'

// 配置OAuth2客户端，这个URI必须与Google控制台中配置的一致
const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';
console.log('Google OAuth2 使用的重定向URI:', redirectUri);

// 为了防止在开发过程中的非关键连接错误使整个过程失败，添加一些重试逻辑
const MAX_RETRIES = 1; // 重试次数

// 只对这些临时性错误进行重试
const RETRYABLE_ERRORS = [
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'NETWORK_ERROR'
];

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
)

// 添加一个详细的错误日志函数
function logError(prefix: string, error: any) {
  console.error(`[${prefix}] 错误:`, error);
  if (error instanceof Error) {
    console.error(`[${prefix}] 错误名称:`, error.name);
    console.error(`[${prefix}] 错误消息:`, error.message);
    console.error(`[${prefix}] 错误堆栈:`, error.stack);
  }
  if (error.response) {
    console.error(`[${prefix}] 响应数据:`, error.response.data);
    console.error(`[${prefix}] 响应状态:`, error.response.status);
  }
}

/**
 * Google登录认证处理
 * 使用OAuth2 API而不是People API获取用户信息
 */
export async function POST(request: Request) {
  // 生成请求ID以便跟踪整个流程
  const requestId = Date.now().toString();
  console.log(`[${requestId}] 收到Google登录请求`);
  
  try {
    // 解析请求体
    let requestBody;
    try {
      requestBody = await request.json();
      console.log(`[${requestId}] 解析请求体成功`);
    } catch (e) {
      console.error(`[${requestId}] 解析请求体失败:`, e);
      return NextResponse.json({ 
        success: false,
        error: '无效的请求格式' 
      }, { status: 400 });
    }
    
    // 获取授权码
    const { code } = requestBody;
    console.log(`[${requestId}] 收到授权码:`, code ? `${code.substring(0, 15)}...` : '无效');

    if (!code) {
      return NextResponse.json({ 
        success: false,
        error: '缺少授权码' 
      }, { status: 400 });
    }

    // 准备获取访问令牌
    console.log(`[${requestId}] 开始获取访问令牌...`);
    console.log(`[${requestId}] 使用的Client ID:`, process.env.GOOGLE_CLIENT_ID?.substring(0, 8) + '...');
    console.log(`[${requestId}] 使用的重定向URI:`, redirectUri);
    
    // 使用函数表达式而不是函数声明以避免严格模式错误
    const getTokenWithRetry = async (retryCount = 0) => {
      try {
        console.log(`[${requestId}] 尝试获取令牌, 尝试次数: ${retryCount + 1}`);
        const { tokens } = await oauth2Client.getToken(code);
        console.log(`[${requestId}] 成功获取到令牌:`, tokens ? '有效' : '无效');
        return tokens;
      } catch (error) {
        // 检查是否是可重试的错误类型
        const errorCode = (error as any).code || '';
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isRetryableError = RETRYABLE_ERRORS.some(err => errorCode.includes(err) || errorMessage.includes(err));
        
        // 明确检查是否是授权码已使用错误
        const isInvalidGrantError = errorMessage.includes('invalid_grant');
        
        if (retryCount < MAX_RETRIES && isRetryableError && !isInvalidGrantError) {
          console.log(`[${requestId}] 获取令牌失败（${errorCode || errorMessage}），正在重试...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
          return getTokenWithRetry(retryCount + 1);
        }
        throw error;
      }
    };
    
    try {
      // 获取访问令牌，最多重试一次
      const tokens = await getTokenWithRetry();
      
      // 验证tokens是否获取成功
      if (!tokens || !tokens.access_token) {
        console.error(`[${requestId}] 获取到的令牌无效`);
        return NextResponse.json({ 
          success: false,
          error: '获取访问令牌失败' 
        }, { status: 401 });
      }
      
      // 使用OAuth2 API获取用户信息，而不是People API
      console.log(`[${requestId}] 开始获取用户信息...`);
      try {
        // 使用OAuth2 API获取用户信息
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`
          }
        });

        if (!userInfoResponse.ok) {
          const errorData = await userInfoResponse.json();
          console.error(`[${requestId}] 获取用户信息失败:`, errorData);
          return NextResponse.json({ 
            success: false,
            error: '获取用户信息失败',
            details: JSON.stringify(errorData)
          }, { status: 401 });
        }

        const userData = await userInfoResponse.json();
        console.log(`[${requestId}] 成功获取用户信息`);

        // OAuth2 API和People API的字段名不同
        const email = userData.email;
        const googleId = userData.sub;  // OAuth2 API使用'sub'而不是'id'
        const name = userData.name || email.split('@')[0];
        const avatar = userData.picture || null;
        
        console.log(`[${requestId}] 用户信息:`, {
          email,
          googleId: googleId ? googleId.substring(0, 8) + '...' : 'null',
          name,
          hasAvatar: !!avatar
        });

        // 验证必要的用户信息
        if (!email || !googleId) {
          console.error(`[${requestId}] 用户信息不完整:`, userData);
          return NextResponse.json({ 
            success: false,
            error: '用户信息不完整' 
          }, { status: 401 });
        }

        // 查找或创建用户
        console.log(`[${requestId}] 开始在数据库中查找用户...`);
        let user;
        try {
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { googleId }
              ]
            }
          });

          if (!user) {
            // 创建新用户
            console.log(`[${requestId}] 创建新用户...`);
            user = await prisma.user.create({
              data: {
                email,
                username: name || email.split('@')[0],
                googleId,
                avatar,
              }
            });
            console.log(`[${requestId}] 用户创建成功 ID:`, user.id);
          } else if (!user.googleId) {
            // 用户已存在但没有Google ID，更新用户信息
            console.log(`[${requestId}] 更新已存在用户的Google信息...`);
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId,
                avatar: avatar || user.avatar,
              }
            });
            console.log(`[${requestId}] 用户更新成功 ID:`, user.id);
          } else {
            console.log(`[${requestId}] 找到已存在用户 ID:`, user.id);
          }
        } catch (dbError) {
          logError(`${requestId} 数据库操作失败`, dbError);
          return NextResponse.json({ 
            success: false,
            error: '数据库操作失败',
            details: dbError instanceof Error ? dbError.message : '未知错误'
          }, { status: 500 });
        }

        // 生成JWT token
        let token;
        try {
          token = generateToken(user.id);
          console.log(`[${requestId}] 已生成JWT令牌`);
          
          // 计算token过期时间 (7天)
          const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          
          // 更新用户的token信息
          await prisma.user.update({
            where: { id: user.id },
            data: {
              accessToken: token,
              tokenExpiresAt,
            }
          });
          console.log(`[${requestId}] 用户令牌信息已更新`);
          
          // 返回成功响应
          console.log(`[${requestId}] 登录流程成功完成`);
          return NextResponse.json({
            success: true,
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              avatar: user.avatar,
              isAdmin: user.isAdmin,
            },
            expiresAt: tokenExpiresAt.toISOString()
          });
        } catch (tokenError) {
          logError(`${requestId} 令牌处理失败`, tokenError);
          return NextResponse.json({ 
            success: false,
            error: '生成或保存令牌失败',
            details: tokenError instanceof Error ? tokenError.message : '未知错误'
          }, { status: 500 });
        }
      } catch (userInfoError) {
        logError(`${requestId} 获取用户信息过程失败`, userInfoError);
        return NextResponse.json({ 
          success: false,
          error: '获取用户信息过程失败',
          details: userInfoError instanceof Error ? userInfoError.message : '未知错误'
        }, { status: 401 });
      }
    } catch (tokenError) {
      logError(`${requestId} 获取令牌失败`, tokenError);
      
      // 检查是否是重定向URI不匹配错误
      const errorMessage = tokenError instanceof Error ? tokenError.message : '认证失败';
      
      if (errorMessage.includes('redirect_uri_mismatch')) {
        return NextResponse.json({ 
          success: false,
          error: '重定向URI不匹配，请检查Google控制台配置', 
          message: errorMessage,
          redirectUri: redirectUri
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        success: false,
        error: '获取Google认证令牌失败', 
        message: errorMessage 
      }, { status: 401 });
    }
  } catch (error) {
    logError(`${requestId} 整体处理过程失败`, error);
    
    // 提供更详细的错误信息
    const errorMessage = error instanceof Error 
      ? `${error.name}: ${error.message}`
      : '认证失败';
      
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
    }, { status: 500 });
  }
} 