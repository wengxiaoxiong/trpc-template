'use client'

import { useSiteConfig } from './SiteConfigProvider'
import { useI18n } from '../i18n-provider'

export function AuthFooter() {
  const { getConfigValue } = useSiteConfig()
  const { t } = useI18n()
  const siteTitle = getConfigValue('site.title', t('title', '模版项目'))
  const siteCopyright = getConfigValue('site.footer.copyright', `© ${getConfigValue('site.year', '2025')} ${siteTitle}. ${t('site.copyright', 'All rights reserved.')}`)
  const siteSlogan = getConfigValue('site.footer.slogan', t('site.slogan', '高性能 · 安全可靠 · 企业级解决方案'))

  return (
    <div className="text-center mt-8 text-gray-500 text-sm">
      <p>{siteCopyright}</p>
      <p className="mt-2">
        {siteSlogan}
      </p>
    </div>
  )
} 