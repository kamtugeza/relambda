import type { CloudFrontHeaders } from 'aws-lambda'
import type { CloudFrontPayload } from '../types'

interface PayloadHeader {
  key: string
  value: string
}

export interface PayloadProps {
  body: {
    data: string
    encoding: 'base64' | 'text'
  }
  headers: PayloadHeader[]
  method: 'GET' | 'HEAD' | 'POST'
  querystring: string
  uri: string
}

export function buildPayload({
  body,
  headers = [],
  method = 'GET',
  querystring = '',
  uri = '/',
}: Partial<PayloadProps> = {}): CloudFrontPayload {
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
