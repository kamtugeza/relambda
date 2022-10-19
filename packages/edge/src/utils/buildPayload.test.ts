import { buildPayload } from './buildPayload'

it('should build CloudFront Origin Request object', () => {
  expect(
    buildPayload({
      body: {
        data: 'FAKE_DATA',
        encoding: 'text',
      },
      headers: [{ key: 'Content-Type', value: 'text/html; charset=UTF-8' }],
      method: 'POST',
      querystring: '?id=1',
      uri: '/user',
    }),
  ).toMatchInlineSnapshot(`
    {
      "Records": [
        {
          "cf": {
            "config": {
              "distributionDomainName": "FAKE_DISTRIBUTION_DOMAIN_NAME",
              "distributionId": "FAKE_DISTRIBUTION_ID",
              "eventType": "origin-request",
              "requestId": "FAKE_REQUEST_ID",
            },
            "request": {
              "body": {
                "action": "read-only",
                "data": "FAKE_DATA",
                "encoding": "text",
                "inputTruncated": false,
              },
              "clientIp": "FAKE_CLIENT_IP",
              "headers": {
                "content-type": [
                  {
                    "key": "Content-Type",
                    "value": "text/html; charset=UTF-8",
                  },
                ],
              },
              "method": "POST",
              "querystring": "?id=1",
              "uri": "/user",
            },
          },
        },
      ],
    }
  `)
})
