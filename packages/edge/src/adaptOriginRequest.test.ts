import type { BuildOriginRequestProps } from './utils/buildOriginRequest'
import { readableStreamToString } from '@remix-run/node'
import cases from 'jest-in-case'
import { adaptOriginRequest } from './adaptOriginRequest'
import { buildOriginRequest } from './utils/buildOriginRequest'

function buildTest(props: Partial<BuildOriginRequestProps> = {}) {
  const payload = buildOriginRequest(props)
  const request = adaptOriginRequest(payload)
  return request
}

cases<{
  name: string
  method: BuildOriginRequestProps['method']
}>(
  'should pass HTTP method:',
  ({ method }) => {
    const request = buildTest({ method })
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
  headers: BuildOriginRequestProps['headers']
  expectedHeaders: Record<string, string[]>
}>(
  'should pass all headers:',
  ({ headers, expectedHeaders }) => {
    const request = buildTest({ headers })
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
  headers: BuildOriginRequestProps['headers']
  name: string
  querystring?: BuildOriginRequestProps['querystring']
  uri?: BuildOriginRequestProps['uri']
}>(
  'should build correct request URL:',
  ({ expectedUrl, headers, querystring, uri }) => {
    const request = buildTest({ headers, querystring, uri })
    expect(request.url).toBe(expectedUrl)
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

cases<{
  body?: BuildOriginRequestProps['body']
  name: string
  method: BuildOriginRequestProps['method']
}>(
  'should not pass body:',
  ({ body, method }) => {
    const request = buildTest({ body, method })
    expect(request.body).toBe(null)
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

cases<{
  body: BuildOriginRequestProps['body']
  headers?: BuildOriginRequestProps['headers']
  name: string
}>(
  'should pass body',
  async ({ body }) => {
    const request = buildTest({ body, method: 'POST' })
    const encoding: BufferEncoding = body.encoding === 'text' ? 'utf8' : 'base64'
    expect(await readableStreamToString(request.body, encoding)).toBe(body.data)
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
