'use client'

import Image from 'next/image'
import { useSiteConfig } from './SiteConfigProvider'

type LogoProps = {
  size?: number
  className?: string
}

export function Logo({ size = 64, className = '' }: LogoProps) {
  const { getConfigValue } = useSiteConfig()
  const siteTitle = getConfigValue('site.title', '模版项目')
  const logoUrl = getConfigValue('site.logo.url', '')

  return (
    <>
      {logoUrl ? (
        <Image
          src={logoUrl}
          width={size}
          height={size}
          alt={siteTitle}
          className={`rounded-full mx-auto ${className}`}
        />
      ) : (
        <div 
          className={`w-${size/4} h-${size/4} mx-auto rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <i className="fas fa-cube text-white text-2xl"></i>
        </div>
      )}
    </>
  )
} 