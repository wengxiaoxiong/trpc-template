'use client'

import { useSiteConfig } from './SiteConfigProvider'

export function AuthFooter() {
  const { getConfigValue } = useSiteConfig()
  const siteTitle = getConfigValue('site.title', '模版项目')
  const siteCopyright = getConfigValue('site.footer.copyright', `© ${getConfigValue('site.year', '2025')} ${siteTitle}. All rights reserved.`)
  const siteSlogan = getConfigValue('site.footer.slogan', '高性能 · 安全可靠 · 企业级解决方案')

  return (
    <div className="text-center mt-8 text-gray-500 text-sm">
      <p>{siteCopyright}</p>
      <p className="mt-2">
        {siteSlogan}
      </p>
    </div>
  )
} 