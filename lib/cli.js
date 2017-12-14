'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var argv = (0, _minimist2.default)(process.argv.slice(2));

  if (argv._[0] === 'help' || argv.help || argv.h) {
    return console.log('\n  Usage:\n\n    stripe-local [options]\n\n  Options:\n\n    --key, -k         Your Stripe secret key\n    --url, -u         The local URL to send webhooks\n    --interval, -i    The interval to poll for new events\n    ');
  }

  (0, _index2.default)({
    secretKey: argv.key || argv.k,
    webhookUrl: argv.url || argv.u,
    interval: argv.interval || argv.i
  });
};

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }