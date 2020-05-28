# This repo is archived as-of 5/28/2020

# Stripe Local

[![Build Status](https://travis-ci.org/jsonmaur/stripe-local.svg?branch=master)](https://travis-ci.org/jsonmaur/stripe-local)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

A library to receive Stripe Webhooks locally with Node. Uses real events from your Stripe account by polling for them at a defined interval and passing the data to your local server.

Stripe Local will only receive events that occur while it is running. Because of this, you will never receive old events.

> *NOTE: This package is meant for a local development environment. For live environments with a publicly accessible URL, you should use [Stripe webhooks](https://stripe.com/docs/webhooks) themselves.*

## Getting Started

```bash
# to use the CLI
$ npm install -g stripe-local

# or the API
$ npm install --save-dev stripe-local

# or Docker
docker run jsonmaur/stripe-local
```

### CLI

```bash
# start listening for events
$ stripe-local --key $STRIPE_KEY --url http://localhost:7000/stripe

# get a list of options
$ stripe-local help
```

### API

```javascript
/* make sure you only run in dev environment */
if (process.env.NODE_ENV === 'development') {
  require('stripe-local')({
    secretKey: process.env.STRIPE_KEY,
    webhookUrl: 'http://localhost:7000/stripe'
  })
}
```

### Using Docker

If you want a quick and easy way to get started, use Docker. This image is located at [jsonmaur/stripe-local](https://hub.docker.com/r/jsonmaur/stripe-local/) on Docker Hub. The two required environment variables are `STRIPE_KEY` and `WEBHOOK_URL`.

```bash
docker run -e "STRIPE_KEY=..." -e "WEBHOOK_URL=..." jsonmaur/stripe-local
```

##### Options

- `secretKey` Your Stripe test secret key. You should set this in an environment variable to avoid committing to version control.

  > Type: string  
  > Required

- `webhookUrl` The local URL to send Stripe webhooks as events are received. This endpoint should be setup in your application to handle [Stripe webhooks](https://stripe.com/docs/webhooks).

  > Type: string  
  > Required

- `interval` The amount of time (in milliseconds) to wait between polling for new events.

  > Type: number  
  > Default: `5000` (5s)

- `quiet` Whether to hide all logged messages.

  > Type: boolean  
  > Default: `false`

## Todo

- [ ] Store requests so we can monitor their statuses
- [ ] Retry failed requests
- [ ] Log request responses

## License

[MIT](LICENSE) © [Jason Maurer](http://maur.co)
