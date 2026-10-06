import { getPortalConfig } from '../lib/portal-config'

export const prerender = true

export function GET() {
  const config = getPortalConfig()
  const configuredUrl = process.env.SITE_URL || config.site?.url
  const seoEnabled = config.seo?.enabled === true && Boolean(configuredUrl)
  if (!seoEnabled) {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const basePath = process.env.BASE_PATH || ''
  const siteUrl = configuredUrl ? addBasePath(configuredUrl, basePath) : undefined
  const sitemap = siteUrl ? `${siteUrl}/sitemap-index.xml` : undefined
  const body = ['User-agent: *', 'Allow: /', sitemap && `Sitemap: ${sitemap}`].filter(Boolean).join('\n') + '\n'

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

function addBasePath(siteUrl: string, basePath: string): string {
  const url = new URL(siteUrl)
  const normalizedBasePath = basePath.replace(/^\/+|\/+$/g, '')
  const normalizedSitePath = url.pathname.replace(/^\/+|\/+$/g, '')

  if (!normalizedBasePath || normalizedSitePath === normalizedBasePath || normalizedSitePath.endsWith(`/${normalizedBasePath}`)) {
    return url.toString().replace(/\/+$/, '')
  }

  url.pathname = `${url.pathname.replace(/\/+$/, '')}/${normalizedBasePath}`
  return url.toString().replace(/\/+$/, '')
}
