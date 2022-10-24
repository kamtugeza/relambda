# Relambda@Edge

The _Relambda@Edge_ is a tiny handler that allows you to run [Remix](https://remix.run/) projects on [AWS Lambda@Edge](https://aws.amazon.com/lambda/edge/).

This package allows you to build infrastructure without forcing you to use a specific IaC library (how it has been done in `@remix-run/architect`).

**NOTE:** the Remix team won't create libraries like this. You can find more info in that [thread](https://github.com/remix-run/remix/pull/3173#issuecomment-1248735404).

## Getting Started

To install the package run the next commands:

```sh
npm i @relambda/edge
```

This package has a peer dependency:

```sh
npm i @remix-run/node # usually it comes with Remix
```

Then you can create handler:

```js
// server/index.js
import * as build from '@remix-run/dev/server-build'
import { createLambdaHandler } from '@relambda/edge'

export const lambdaHandler = createLambdaHandler({
  build,
  mode: process.env.NODE_ENV,
})
```

Don't forget to alter you [Remix Config](https://remix.run/docs/en/v1/api/conventions#server) and add path to the server entry point:

```js
// remix.config.js
module.exports = {
  server: 'server', // path to entry point
}
```

Build and deploy your magic to the AWS Lambda@Edge! 🤠
