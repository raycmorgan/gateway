var Gateway = exports;

process.mixin(
  Gateway,
  require('./gateway/handler'),
  require('./gateway/middleware')
);

Gateway.Builder = require('./gateway/builder');
Gateway.Response = require('./gateway/response');

Gateway.utils = require('./gateway/utils');
