import type { CloudFrontHeaders } from 'aws-lambda'
import type { CloudFrontPayload } from './types'
import { readableStreamToString } from '@remix-run/node'
import cases from 'jest-in-case'
import { createRemixRequest } from './createRemixRequest'

interface MockHeader {
  key: string
  value: string
}

interface MockEventProps {
  body: {
    data: string
    encoding: 'base64' | 'text'
  }
  headers: MockHeader[]
  method: 'GET' | 'HEAD' | 'POST'
  querystring: string
  uri: string
}

function createMockEvent({
  body,
  headers = [],
  method = 'GET',
  querystring = '',
  uri = '/',
}: Partial<MockEventProps>): CloudFrontPayload {
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

cases<{
  name: string
  method: MockEventProps['method']
}>(
  'should pass HTTP method:',
  ({ method }) => {
    const event = createMockEvent({ method })
    const request = createRemixRequest(event)
    expect(request.method).toBe(method)
  },
  [
    {
      name: 'GET request',
      method: 'GET',
    },
    {
      name: 'POST request',
      method: 'POST',
    },
  ],
)

cases<{
  name: string
  headers: MockEventProps['headers']
  expectedHeaders: Record<string, string[]>
}>(
  'should pass all headers:',
  ({ headers, expectedHeaders }) => {
    const event = createMockEvent({ headers })
    const request = createRemixRequest(event)
    expect(request.headers.raw()).toEqual(expectedHeaders)
  },
  [
    {
      expectedHeaders: {},
      headers: [],
      name: 'no headers',
    },
    {
      expectedHeaders: {
        host: ['localhost:3000'],
        'cache-control': ['no-cache, cf-no-cache'],
      },
      headers: [
        { key: 'Host', value: 'localhost:3000' },
        { key: 'Cache-Control', value: 'no-cache, cf-no-cache' },
      ],
      name: 'passed headers',
    },
  ],
)

cases<{
  expectedUrl: string
  headers: MockEventProps['headers']
  name: string
  querystring?: MockEventProps['querystring']
  uri?: MockEventProps['uri']
}>(
  'should build correct request URL:',
  ({ expectedUrl, headers, querystring, uri }) => {
    const event = createMockEvent({ headers, querystring, uri })
    const result = createRemixRequest(event)
    expect(result.url).toBe(expectedUrl)
  },
  [
    {
      expectedUrl: 'http://localhost:3000/',
      headers: [
        { key: 'X-Forwarded-Host', value: 'localhost:3000' }, // precedence over `Host` header
        { key: 'Host', value: 'localhost:4000' },
      ],
      name: 'using `X-Forwarded-Host` header',
    },
    {
      expectedUrl: 'http://localhost:4000/',
      headers: [{ key: 'Host', value: 'localhost:4000' }],
      name: 'using `Host` header',
    },
    {
      expectedUrl: 'http://localhost:4000/user',
      headers: [{ key: 'Host', value: 'localhost:4000' }],
      name: 'using URI',
      uri: '/user',
    },
    {
      expectedUrl: 'http://localhost:4000/?id=1',
      headers: [{ key: 'Host', value: 'localhost:4000' }],
      name: 'using Query String',
      querystring: 'id=1',
    },
  ],
)

cases<{ body?: MockEventProps['body']; name: string; method: MockEventProps['method'] }>(
  'should not pass body:',
  ({ body, method }) => {
    const event = createMockEvent({ body, method })
    const result = createRemixRequest(event)
    expect(result.body).toBe(null)
  },
  [
    {
      body: { data: 'FAKE_BODY', encoding: 'text' },
      name: 'GET request with payload',
      method: 'GET',
    },
    {
      body: { data: 'FAKE_BODY', encoding: 'text' },
      name: 'HEAD request with payload',
      method: 'HEAD',
    },
    { name: 'requests without payload', method: 'POST' },
  ],
)

cases<{ body: MockEventProps['body']; headers?: MockEventProps['headers']; name: string }>(
  'should pass body',
  async ({ body }) => {
    const event = createMockEvent({ body, method: 'POST' })
    const result = createRemixRequest(event)
    const encoding: BufferEncoding = body.encoding === 'text' ? 'utf8' : 'base64'
    expect(await readableStreamToString(result.body, encoding)).toBe(body.data)
  },
  [
    {
      body: {
        data: 'FAKE_TEXT',
        encoding: 'text',
      },
      name: 'request with text payload',
    },
    {
      body: {
        data: 'RkFLRV9TVFJFQU0=',
        encoding: 'base64',
      },
      name: 'request with binary data',
    },
    {
      body: {
        data: 'LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5QWIycGY1RDdkUVpIdjczVgpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9IkZBS0VfRklFTEQiCgpGQUtFX1ZBTFVFCi0tLS0tLVdlYktpdEZvcm1Cb3VuZGFyeUFiMnBmNUQ3ZFFaSHY3M1YtLQ==',
        encoding: 'base64',
      },
      headers: [
        {
          key: 'Content-Type',
          value: 'multipart/form-data',
        },
      ],
      name: 'request with `multipart/form-data`',
    },
  ],
)
