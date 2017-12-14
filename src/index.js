import assert from 'assert'
import Stripe from 'stripe'
import axios from 'axios'
import crypto from 'crypto'

module.exports = (opts = {}) => {
  assert(typeof opts === 'object', 'Options must be an object')
  assert(opts.secretKey, 'Must pass your Stripe secret key!')
  assert(opts.webhookUrl, 'Must pass a webhook URL!')

  opts.webhookSecret = opts.webhookSecret || false
  opts.quiet = opts.quiet || false
  opts.interval = opts.interval
    ? parseInt(opts.interval, 10)
    : 5000

  const stripe = Stripe(opts.secretKey)
  const currentTimeStamp = () => Math.floor(Date.now() / 1000)
  const generateSignature = (secret, payload) => crypto.createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')

  const request = axios.create({
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  let lastTimestamp = currentTimeStamp() - (opts.interval / 1000)
  setInterval(() => {
    stripe.events.list({
      created: {
        gt: lastTimestamp
      }
    }, (err, evts) => {
      if (err) return console.error(err)

      lastTimestamp = currentTimeStamp()
      Promise.all(evts.data.map(evt => {
        return stripe.events.retrieve(evt.id)
          .then(data => {
            !opts.quiet && console.log(`Received Stripe Event: ${evt.id}`)
            let headers = {}
            if (opts.webhookSecret) {
              console.log(`Signing Event: ${evt.id}`)
              let signature = generateSignature(opts.webhookSecret, `${lastTimestamp}.${JSON.stringify(data)}`)
              headers['stripe-signature'] = `t=${lastTimestamp},v1=${signature}`
            }
            return request.post(opts.webhookUrl, data, { headers })
              .then(res => !opts.quiet && console.log(res.data))
          })
      })).catch(err => console.error(err))
    })
  }, opts.interval)
}
