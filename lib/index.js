'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _stripe = require('stripe');

var _stripe2 = _interopRequireDefault(_stripe);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  (0, _assert2.default)((typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) === 'object', 'Options must be an object');
  (0, _assert2.default)(opts.secretKey, 'Must pass your Stripe secret key!');
  (0, _assert2.default)(opts.webhookUrl, 'Must pass a webhook URL!');

  opts.webhookSecret = opts.webhookSecret || false;
  opts.quiet = opts.quiet || false;
  opts.interval = opts.interval ? parseInt(opts.interval, 10) : 5000;

  var stripe = (0, _stripe2.default)(opts.secretKey);
  var currentTimeStamp = function currentTimeStamp() {
    return Math.floor(Date.now() / 1000);
  };
  var generateSignature = function generateSignature(secret, payload) {
    return _crypto2.default.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
  };

  var request = _axios2.default.create({
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  var lastTimestamp = currentTimeStamp() - opts.interval / 1000;
  setInterval(function () {
    stripe.events.list({
      created: {
        gt: lastTimestamp
      }
    }, function (err, evts) {
      if (err) return console.error(err);

      lastTimestamp = currentTimeStamp();
      Promise.all(evts.data.map(function (evt) {
        return stripe.events.retrieve(evt.id).then(function (data) {
          !opts.quiet && console.log('Received Stripe Event: ' + evt.id);
          var headers = {};
          if (opts.webhookSecret) {
            console.log('Signing Event: ' + evt.id);
            var signature = generateSignature(opts.webhookSecret, lastTimestamp + '.' + JSON.stringify(data));
            headers['stripe-signature'] = 't=' + lastTimestamp + ',v1=' + signature;
          }
          return request.post(opts.webhookUrl, data, { headers: headers }).then(function (res) {
            return !opts.quiet && console.log(res.data);
          });
        });
      })).catch(function (err) {
        return console.error(err);
      });
    });
  }, opts.interval);
};