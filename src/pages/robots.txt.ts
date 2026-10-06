import { getPortalConfig } from '../lib/portal-config'

export const prerender = true

export function GET() {
  const config = getPortalConfig()
  const configuredUrl = process.env.SITE_URL || config.site?.url
  const seoEnabled = config.seo?.enabled === true && Boolean(configuredUrl)
  if (!seoEnabled) {
    return disallowRobots()
  }

  const basePath = process.env.BASE_PATH || ''
  let siteUrl
  try {
    siteUrl = configuredUrl ? addBasePath(configuredUrl, basePath) : undefined
  } catch {
    return disallowRobots()
  }
  const sitemap = siteUrl ? `${siteUrl}/sitemap-index.xml` : undefined
  const body = ['User-agent: *', 'Allow: /', sitemap && `Sitemap: ${sitemap}`].filter(Boolean).join('\n') + '\n'

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

function addBasePath(siteUrl: string, basePath: string): string {
  const url = new URL(siteUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('unsupported protocol')
  if (url.username || url.password) throw new Error('userinfo is not allowed')
  url.search = ''
  url.hash = ''
  const normalizedBasePath = basePath.replace(/^\/+|\/+$/g, '')

  if (normalizedBasePath) {
    url.pathname = `/${normalizedBasePath}`
    return url.toString().replace(/\/+$/, '')
  }

  return url.toString().replace(/\/+$/, '')
}

function disallowRobots(): Response {
  return new Response('User-agent: *\nDisallow: /\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
