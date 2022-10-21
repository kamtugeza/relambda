import type { CloudFrontHeaders } from 'aws-lambda'
import type { CloudFrontOriginRequest } from '../types'

interface BuildOriginRequestHeader {
  key: string
  value: string
}

export interface BuildOriginRequestProps {
  body: {
    data: string
    encoding: 'base64' | 'text'
  }
  headers: BuildOriginRequestHeader[]
  method: 'GET' | 'HEAD' | 'POST'
  querystring: string
  uri: string
}

export function buildOriginRequest({
  body,
  headers = [],
  method = 'GET',
  querystring = '',
  uri = '/',
}: Partial<BuildOriginRequestProps> = {}): CloudFrontOriginRequest {
  return {
    Records: [
      {
        cf: {
          config: {
            distributionDomainName: 'FAKE_DISTRIBUTION_DOMAIN_NAME',
            distributionId: 'FAKE_DISTRIBUTION_ID',
            eventType: 'origin-request',
            requestId: 'FAKE_REQUEST_ID',
          },
          request: {
            body: body ? { ...body, action: 'read-only', inputTruncated: false } : undefined,
            clientIp: 'FAKE_CLIENT_IP',
            headers: headers.reduce((acc, header) => {
              acc[header.key.toLowerCase()] = [header]
              return acc
            }, {} as CloudFrontHeaders),
            method,
            uri,
            querystring,
          },
        },
      },
    ],
  }
}
