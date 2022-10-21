import type { AppLoadContext, Response as NodeResponse, ServerBuild } from '@remix-run/node'
import type { CloudFrontResultResponse } from 'aws-lambda'
import type { CloudFrontOriginRequest } from './types'
import { createRequestHandler } from '@remix-run/node'
import { adaptOriginRequest } from './adaptOriginRequest'
import { adaptRemixResponse } from './adaptRemixResponse'

interface LambdaHandlerProps {
  build: ServerBuild
  loadContext?: (event: CloudFrontOriginRequest) => AppLoadContext
  mode: typeof process.env.NODE_ENV
}

export function createLambdaHandler({
  loadContext,
  build,
  mode = process.env.NODE_ENV,
}: LambdaHandlerProps) {
  const requestRemix = createRequestHandler(build, mode)
  return async (event: CloudFrontOriginRequest): Promise<CloudFrontResultResponse> => {
    const request = adaptOriginRequest(event)
    const context = loadContext?.(event)
    const response = (await requestRemix(request, context)) as NodeResponse
    return await adaptRemixResponse(response)
  }
}
