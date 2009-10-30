var Gateway = exports;

process.mixin(
  Gateway,
  require('gateway/builder.js'),
  require('gateway/handler.js'),
  require('gateway/middleware.js'),
  require('gateway/response.js')
);
