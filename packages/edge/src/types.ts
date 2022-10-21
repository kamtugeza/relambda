import type { CloudFrontEvent, CloudFrontRequest } from 'aws-lambda'

export interface CloudFrontRecordData extends CloudFrontEvent {
  request: CloudFrontRequest
}

export interface CloudFrontRecord {
  cf: CloudFrontRecordData
}

export interface CloudFrontOriginRequest {
  Records: CloudFrontRecord[]
}
