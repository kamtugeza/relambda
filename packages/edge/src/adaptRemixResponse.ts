import type { Response as NodeResponse } from '@remix-run/node'
import type { CloudFrontHeaders, CloudFrontResultResponse } from 'aws-lambda'
import { readableStreamToString } from '@remix-run/node'
import { checkBinary } from './utils/checkBinary'

/** Convert Remix response into CloudFront response. */
export async function adaptRemixResponse(
  response: NodeResponse,
): Promise<CloudFrontResultResponse> {
  return {
    body: await getBody(response),
    bodyEncoding: getBodyEncoding(response),
    headers: getHeaders(response),
    status: `${response.status}`,
    statusDescription: response.statusText,
  }
}

async function getBody(response: NodeResponse): Promise<CloudFrontResultResponse['body']> {
  if (!response.body) return
  const contentType = response.headers.get('Content-Type')
  const isBinary = checkBinary(contentType)
  return isBinary ? await readableStreamToString(response.body, 'base64') : await response.text()
}

function getBodyEncoding(
  response: NodeResponse,
): Exclude<CloudFrontResultResponse['bodyEncoding'], undefined> {
  const contentType = response.headers.get('Content-Type')
  const isBinary = checkBinary(contentType)
  return isBinary ? 'base64' : 'text'
}

function getHeaders(response: NodeResponse): CloudFrontHeaders {
  const headers: CloudFrontHeaders = {}
  for (const [key, value] of response.headers.entries()) {
    headers[key] = [{ value }]
  }
  return headers
}
