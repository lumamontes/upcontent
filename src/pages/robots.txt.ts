import { getPortalConfig } from '../lib/portal-config'

export const prerender = true

export function GET() {
  const config = getPortalConfig()
  if (config.seo?.enabled !== true) {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const configuredUrl = process.env.SITE_URL || config.site?.url
  const basePath = process.env.SITE_URL ? (process.env.BASE_PATH || '') : ''
  const siteUrl = configuredUrl ? `${configuredUrl.replace(/\/+$/, '')}${basePath.replace(/\/+$/, '')}` : undefined
  const sitemap = siteUrl ? `${siteUrl}/sitemap-index.xml` : undefined
  const body = ['User-agent: *', 'Allow: /', sitemap && `Sitemap: ${sitemap}`].filter(Boolean).join('\n') + '\n'

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
