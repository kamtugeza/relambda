import type { CloudFrontHeaders, CloudFrontResultResponse } from 'aws-lambda'
import { Readable } from 'node:stream'
import { createReadableStreamFromReadable, Response as NodeResponse } from '@remix-run/node'
import cases from 'jest-in-case'
import { adaptRemixResponse } from './adaptRemixResponse'

interface TestProps {
  body: string | ReturnType<typeof createReadableStreamFromReadable>
  headers: Record<string, string>
  status: number
  statusText: string
}

async function buildTest({
  body,
  headers = {},
  status = 200,
  statusText,
}: Partial<TestProps> = {}): Promise<CloudFrontResultResponse> {
  const response = new NodeResponse(body, { headers, status, statusText })
  const result = await adaptRemixResponse(response)
  return result
}

cases<{
  name: string
  status: TestProps['status']
  statusText?: TestProps['statusText']
  expected: Pick<CloudFrontResultResponse, 'status' | 'statusDescription'>
}>(
  'should pass status and its description',
  async ({ expected, status, statusText }) => {
    const response = await buildTest({ status, statusText })
    expect(response.status).toBe(expected.status)
    expect(response.statusDescription).toBe(expected.statusDescription)
  },
  [
    {
      name: '200 without description',
      status: 200,
      statusText: undefined,
      expected: { status: '200', statusDescription: '' },
    },
    {
      name: '404 with description',
      status: 404,
      statusText: 'Not Found',
      expected: { status: '404', statusDescription: 'Not Found' },
    },
  ],
)

cases<{ expected: CloudFrontHeaders; headers?: TestProps['headers']; name: string }>(
  'should pass all headers',
  async ({ expected, headers }) => {
    const response = await buildTest({ headers })
    expect(response.headers).toEqual(expected)
  },
  [
    { name: 'no headers', headers: undefined, expected: {} },
    {
      name: 'headers exist',
      headers: { 'Content-Type': 'multipart/form-data' },
      expected: { 'content-type': [{ value: 'multipart/form-data' }] },
    },
  ],
)

cases<{
  body?: TestProps['body']
  expected: {
    body: string | undefined
    encoding: Exclude<CloudFrontResultResponse['bodyEncoding'], undefined>
  }
  headers?: TestProps['headers']
  name: string
}>(
  'should pass body and its encoding',
  async ({ body, expected, headers }) => {
    const response = await buildTest({ body, headers })
    expect(response.body).toBe(expected.body)
    expect(response.bodyEncoding).toBe(expected.encoding)
  },
  [
    {
      name: 'no body and headers',
      body: undefined,
      headers: undefined,
      expected: {
        body: undefined,
        encoding: 'text',
      },
    },
    {
      name: 'no body and `content-type` is related to text',
      body: undefined,
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
      expected: {
        body: undefined,
        encoding: 'text',
      },
    },
    {
      name: 'no body and `content-type` is related to binary',
      body: undefined,
      headers: { 'Content-Type': 'application/pdf' },
      expected: {
        body: undefined,
        encoding: 'base64',
      },
    },
    {
      name: 'body exists and `content-type` header is related to text',
      body: 'FAKE_BODY',
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
      expected: {
        body: 'FAKE_BODY',
        encoding: 'text',
      },
    },
    {
      name: 'body exists and `content-type` is related to binary',
      body: createReadableStreamFromReadable(Readable.from(['FAKE_PDF'])),
      headers: { 'Content-Type': 'application/pdf' },
      expected: {
        body: 'RkFLRV9QREY=',
        encoding: 'base64',
      },
    },
  ],
)
