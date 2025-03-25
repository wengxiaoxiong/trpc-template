import { NextResponse } from 'next/server';

/**
 * 处理日志请求
 * 这个端点可能是某些框架内部使用的，我们提供一个简单实现以避免404错误
 */
export async function POST(request: Request) {
  try {
    // 尝试读取日志数据但不做任何处理
    const data = await request.json();
    console.log("Auth log request:", data);
  } catch (error) {
    // 忽略任何解析错误
  }
  
  return NextResponse.json({ success: true });
} 