'use client'

import { useSiteConfig } from './SiteConfigProvider'
import { Logo } from './Logo'

type AuthHeaderProps = {
  showDesc?: boolean
}

export function AuthHeader({ showDesc = true }: AuthHeaderProps) {
  const { getConfigValue } = useSiteConfig()
  const siteTitle = getConfigValue('site.title', '模版项目')
  const siteDesc = getConfigValue('site.description', '高级平台')

  return (
    <div className="text-center mb-8">
      <Logo className="mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{siteTitle}</h1>
      {showDesc && <p className="text-gray-500">{siteDesc}</p>}
    </div>
  )
} 