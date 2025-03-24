import { NextResponse } from 'next/server'
import { prisma } from '@/utils/prisma'
import { generateToken } from '@/utils/jwt'
import { OAuth2Client } from 'google-auth-library'

interface GoogleUserInfo {
  email: string
  sub: string
  picture?: string
}

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/login/'
)

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: '缺少授权码' }, { status: 400 })
    }

    // 使用授权码获取访问令牌
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    // 获取用户信息
    const userInfo = await client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    })

    const { email, sub: googleId, picture: avatar } = userInfo.data as GoogleUserInfo

    // 查找或创建用户
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email! },
          { googleId }
        ]
      }
    })

    if (!user) {
      // 创建新用户
      user = await prisma.user.create({
        data: {
          email: email!,
          username: email!.split('@')[0],
          googleId,
          avatar,
        }
      })
    } else if (!user.googleId) {
      // 更新现有用户
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatar,
        }
      })
    }

    // 生成 JWT token
    const token = generateToken(user.id)

    // 更新用户的 token 信息
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: token,
        tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
      }
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
      }
    })
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json({ error: '认证失败' }, { status: 500 })
  }
} 