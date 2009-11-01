var Gateway = exports;

process.mixin(
  Gateway,
  require('./gateway/builder'),
  require('./gateway/handler'),
  require('./gateway/middleware'),
  require('./gateway/response')
);

Gateway.utils = require('./gateway/utils');
