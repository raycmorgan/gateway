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
  var root = opts.root || ".";
  var urls = opts.urls || ['/favicon.ico'];
  var blockSize = opts.blockSize || 256 * 32; // 8192 bytes
  
  return function (request, response) {
    var match = urls.some(function (u) {
      if (typeof(u) === 'string') {
        return request.PATH_INFO.indexOf(u) === 0;
      } else if (u instanceof RegExp) {
        return u.exec(request.PATH_INFO);
      }
    });
    
    if (match) {
      var path = node.path.join(root, request.REQUEST_PATH);
      node.fs.stat(path, 'binary').
        addCallback(function (stats) {
          if (stats.isFile()) {
            var size = stats.size;
            node.fs.open(path, node.O_RDONLY, 0666).
              addCallback(function (fd) {
                sendHeader(response, size, blockSize);
                sendFile(response, fd, size, 0, blockSize);
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

/**
 * This is used to serve the header of the request.
 * 
 * @private
 * @param {Response} response The response object passed to the middleware
 * @param {Integer} size The length of the file
 * @param {Integer} blockSize The size of each read chunk
 */
function sendHeader(response, size, blockSize) {
  var headers = {};
  headers['content-length'] = size
  if (size > blockSize) {
    headers['content-enconding'] = 'chunked';
  }
  response.sendHeader(200, headers);
}

/**
 * This is responsible to stream the file back to the client. It recursively
 * calls back to node.fs.read until the entire file is read back.
 * 
 * WARNING: This will explode if (size / blockSize > JS max stack size).
 * 
 * @private
 */
function sendFile(response, fd, size, pos, blockSize) {
  if (pos < size) {
    var len = Math.min(blockSize, size - pos);
    node.fs.read(fd, len, pos, 'binary').
      addCallback(function (content, l) {
        response.sendBody(content, 'binary');
        sendFile(response, fd, size, pos + len, blockSize);
      })
      .addErrback(function () {
        node.fs.close(fd);
        response.finish();
      });
  } else {
    node.fs.close(fd);
    response.finish();
  }
}
