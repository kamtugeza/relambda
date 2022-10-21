import type { AppLoadContext, Response as NodeResponse, ServerBuild } from '@remix-run/node'
import type { CloudFrontResultResponse } from 'aws-lambda'
import type { CloudFrontPayload } from './types'
import { createRequestHandler } from '@remix-run/node'
import { adaptPayload } from './adaptPayload'
import { adaptRemixResponse } from './adaptRemixResponse'

interface LambdaHandlerProps {
  build: ServerBuild
  loadContext?: (payload: CloudFrontPayload) => AppLoadContext
  mode: typeof process.env.NODE_ENV
}

export function createLambdaHandler({
  loadContext,
  build,
  mode = process.env.NODE_ENV,
}: LambdaHandlerProps) {
  const requestRemix = createRequestHandler(build, mode)
  return async (payload: CloudFrontPayload): Promise<CloudFrontResultResponse> => {
    const request = adaptPayload(payload)
    const context = loadContext?.(payload)
    const response = (await requestRemix(request, context)) as NodeResponse
    return await adaptRemixResponse(response)
  }
}
