import type { CloudFrontRequest } from 'aws-lambda'
import type { CloudFrontOriginRequest } from './types'
import { Headers as NodeHeaders, Request as NodeRequest } from '@remix-run/node'

export function adaptOriginRequest({ Records }: CloudFrontOriginRequest): NodeRequest {
  const request = Records[0].cf.request
  return new NodeRequest(getUrl(request), {
    body: getBody(request),
    headers: getHeaders(request),
    method: request.method,
  })
}

function getBody({ body, headers, method }: CloudFrontRequest): Buffer | string | null {
  if (['GET', 'HEAD'].includes(method) || !body) return null
  const { data = null, encoding } = body
  if (!data || encoding !== 'base64') return data
  const contentType = headers['content-type']?.[0]?.value
  return contentType?.includes('multipart/form-data')
    ? Buffer.from(data, 'base64')
    : Buffer.from(data, 'base64').toString()
}

function getHeaders({ headers }: CloudFrontRequest): NodeHeaders {
  const list = []
  for (const item of Object.values(headers)) {
    if (!item[0].key) continue
    list.push([item[0].key, item[0].value])
  }
  return new NodeHeaders(list)
}

function getUrl({ headers, querystring, uri }: CloudFrontRequest): string {
  const schema = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const host = headers['x-forwarded-host']?.[0]?.value || headers.host?.[0]?.value
  const search = querystring.length > 0 ? `?${querystring}` : ''
  const { href } = new URL(`${uri}${search}`, `${schema}://${host}`)
  return href
}
