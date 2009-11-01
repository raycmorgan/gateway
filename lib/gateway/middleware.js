exports.Middleware = {};

process.mixin(
  exports.Middleware,
  require('./middleware/common_logger'),
  require('./middleware/content_type'),
  require('./middleware/head'),
  require('./middleware/lint'),
  require('./middleware/simple_response'),
  require('./middleware/static')
);
