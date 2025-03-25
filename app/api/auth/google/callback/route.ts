import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { redirect } from 'next/navigation'

/**
 * Google OAuth回调处理
 * 接收Google认证服务器的回调，然后重定向到前端
 */
export async function GET(request: Request) {
  try {
    // 获取URL和查询参数
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    
    console.log('Google Callback URL:', url.toString());
    console.log('Google Callback Code:', code?.substring(0, 10) + '...');
    console.log('Google Callback Error:', error);

    // 如果有错误参数，重定向到登录页面并显示错误
    if (error) {
      console.error('Google auth callback error:', error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(error)}`)
    }

    // 如果没有授权码，重定向到登录页面
    if (!code) {
      console.error('Google auth callback missing code')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent('授权失败')}`)
    }

    // 将授权码传递到前端处理
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login?code=${encodeURIComponent(code)}`;
    console.log('Redirecting to:', redirectUrl);
    
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Google auth callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent('认证服务错误')}`)
  }
} 