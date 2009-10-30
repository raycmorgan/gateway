exports.Middleware = {};

process.mixin(
  exports.Middleware,
  require('middleware/common_logger.js'),
  require('middleware/content_type.js'),
  require('middleware/head.js'),
  require('middleware/lint.js'),
  require('middleware/simple_response.js'),
  require('middleware/static.js')
);
