import type { Request as NodeRequest } from '@remix-run/node'
import { Response as NodeResponse, createRequestHandler } from '@remix-run/node'
import { createLambdaHandler } from './createLambdaHandler'
import { buildPayload } from './utils/buildPayload'

jest.mock('@remix-run/node', () => {
  const original = jest.requireActual('@remix-run/node')
  return {
    ...original,
    createRequestHandler: jest.fn(),
  }
})

const mockedBuilder = createRequestHandler as jest.MockedFunction<typeof createRequestHandler>
const mockedHandler = jest.fn()
mockedBuilder.mockImplementation(() => mockedHandler)
const mockedLoadContext = jest.fn()

afterEach(() => {
  mockedLoadContext.mockReset()
  mockedHandler.mockReset()
})

afterAll(() => jest.restoreAllMocks())

it('should process the Origin Request with the Remix handler and return its result', async () => {
  mockedHandler.mockImplementation(async ({ body, headers }: NodeRequest) => {
    return new NodeResponse(body, {
      headers,
      status: 200,
      statusText: 'OK',
    })
  })
  mockedLoadContext.mockImplementation(() => ({ userId: 'FAKE_USER_ID' }))
  const payload = buildPayload({
    body: {
      data: 'FAKE_BODY',
      encoding: 'text',
    },
    headers: [
      { key: 'Content-Type', value: 'text/plain; charset=UTF-8' },
      { key: 'Host', value: 'localhost:4000' },
    ],
    method: 'POST',
    querystring: 'id=10',
    uri: '/user',
  })
  const handler = createLambdaHandler({ loadContext: mockedLoadContext } as any)
  expect(await handler(payload)).toMatchInlineSnapshot(`
    {
      "body": "FAKE_BODY",
      "bodyEncoding": "text",
      "headers": {
        "content-type": [
          {
            "value": "text/plain; charset=UTF-8",
          },
        ],
        "host": [
          {
            "value": "localhost:4000",
          },
        ],
      },
      "status": "200",
      "statusDescription": "OK",
    }
  `)
  expect(mockedBuilder).toHaveBeenCalledTimes(1)
  expect(mockedLoadContext).toHaveBeenCalledTimes(1)
  expect(mockedLoadContext).toHaveBeenCalledWith(payload)
  expect(mockedHandler).toHaveBeenCalledTimes(1)
  expect(mockedHandler.mock.lastCall).toMatchInlineSnapshot(`
    [
      NodeRequest {
        "agent": undefined,
        "compress": true,
        "counter": 0,
        "follow": 20,
        "highWaterMark": 16384,
        "insecureHTTPParser": false,
        "size": 0,
        Symbol(Body internals): {
          "body": ReadableStream {
            "_disturbed": true,
            "_readableStreamController": ReadableStreamDefaultController {
              "_cancelAlgorithm": undefined,
              "_closeRequested": true,
              "_controlledReadableStream": [Circular],
              "_pullAgain": false,
              "_pullAlgorithm": undefined,
              "_pulling": false,
              "_queue": SimpleQueue {
                "_back": {
                  "_elements": [
                    undefined,
                  ],
                  "_next": undefined,
                },
                "_cursor": 1,
                "_front": {
                  "_elements": [
                    undefined,
                  ],
                  "_next": undefined,
                },
                "_size": 0,
              },
              "_queueTotalSize": 0,
              "_started": true,
              "_strategyHWM": 1,
              "_strategySizeAlgorithm": undefined,
            },
            "_reader": ReadableStreamDefaultReader {
              "_closedPromise": Promise {},
              "_closedPromise_reject": undefined,
              "_closedPromise_resolve": undefined,
              "_ownerReadableStream": [Circular],
              "_readRequests": SimpleQueue {
                "_back": {
                  "_elements": [],
                  "_next": undefined,
                },
                "_cursor": 0,
                "_front": {
                  "_elements": [],
                  "_next": undefined,
                },
                "_size": 0,
              },
            },
            "_state": "closed",
            "_storedError": undefined,
          },
          "boundary": null,
          "disturbed": false,
          "error": null,
          "size": 9,
          "type": "text/plain;charset=UTF-8",
        },
        Symbol(Request internals): {
          "headers": Headers {
            Symbol(query): [
              "content-type",
              "text/plain; charset=UTF-8",
              "host",
              "localhost:4000",
            ],
            Symbol(context): null,
          },
          "method": "POST",
          "parsedURL": "http://localhost:4000/user?id=10",
          "redirect": "follow",
          "signal": null,
        },
      },
      {
        "userId": "FAKE_USER_ID",
      },
    ]
  `)
})
