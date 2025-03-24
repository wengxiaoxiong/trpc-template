import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 判断是否是公共文件
function isPublicFile(pathname: string) {
  return /\.(ico|jpg|jpeg|png|gif|svg|js|css|txt|ttf|woff|woff2)$/i.test(pathname);
}

// 判断是否是API请求
function isApiRequest(pathname: string) {
  return pathname.startsWith('/api/');
}

// middleware处理函数
export function middleware(request: NextRequest) {
  // 此处可以添加其他中间件逻辑，例如认证检查等
  return NextResponse.next();
}

// 配置中间件匹配路径
export const config = {
  matcher: [
    // 排除静态资源
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}; 