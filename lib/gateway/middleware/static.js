/**
 * The Static middleware intercepts requests to static files based on url
 * prefixes and a root path. This allows Gateway to serve static files
 * alongside dynamic content.
 * 
 * This example serves static files from pathes such as:
 *    /public/css/base.css
 *    /public/js/main.js
 * 
 * @example
 *    builder.use(Gateway.Middleware.Static, {
 *      urls: ['/favicon.js', '/css', '/js'],
 *      root: node.path.join(node.path.dirname(__filename), 'public')
 *    });
 * 
 * @param {Function} app The application to call if no static file is found
 * @param {Object} opts Options
 * @param {String} opts.root The path to serve all static files from
 * @param {Array} opts.urls Url prefixes to serve static files from
 */
exports.Static = function Static(app, opts) {
  opts = opts || {};
  opts.root = opts.root || ".";
  opts.urls = opts.urls || ['/favicon.ico'];
  
  opts.urls = opts.urls.map(function (url) {
    if (typeof(url) === 'string') {
      return new RegExp("^" + url);
    } else if (url instanceof RegExp) {
      return url;
    } else {
      throw("URLs passed to Static middleware must be of type string or regexp.");
    }
  });
  
  return function (request, response) {
    if (opts.urls.some(function (u) { return u.exec(request.SCRIPT_NAME) })) {
      var path = node.path.join(opts.root, request.REQUEST_PATH);
      node.fs.stat(path).
        addCallback(function (stats) {
          if (stats.isFile()) {
            // TODO: stream the file back instead of buffering in memory
            node.fs.cat(path).
              addCallback(function (contents) {
                response.sendHeader(200, {
                  'Content-Length': contents.length,
                });
                response.sendBody(contents);
                response.finish();
              }).
              addErrback(function () {
                app(request, response);
              });
          } else {
            app(request, response);
          }
        }).
        addErrback(function () {
          app(request, response);
        });
    } else {
      app(request, response);
    }
  }
};
