import { NextResponse } from 'next/server';

/**
 * 处理会话请求
 * 这个端点用于与next-auth兼容，但我们使用自定义认证，所以返回空会话
 */
export async function GET() {
  return NextResponse.json({ 
    user: null,
    expires: null 
  });
} 