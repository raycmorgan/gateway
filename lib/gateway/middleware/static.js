var posix = require('posix');
var Path  = require('path');

/**
 * The Static middleware intercepts requests to static files based on url
 * prefixes and a root path. This allows Gateway to serve static files
 * alongside dynamic content.
 * 
 * The file is streamed back to the client. The size of the blocks to read from
 * disk each read can be changed with opts.blockSize.
 * 
 * This example serves static files from pathes such as:
 *    /public/css/base.css
 *    /public/js/main.js
 * 
 * @example
 *    builder.use(Gateway.Middleware.Static, {
 *      urls: ['/favicon.ico', '/css', '/js'],
 *      root: process.path.join(process.path.dirname(__filename), 'public')
 *    });
 * 
 * @param {Function} app The application to call if no static file is found
 * @param {Object} opts Options
 * @param {String} opts.root The path to serve all static files from
 * @param {Array} opts.urls Url prefixes to serve static files from
 * @param {Integer} opts.blockSize Number of byes to read from disk each pass
 */
exports.Static = function Static(app, opts) {
  opts = opts || {};
  var root = opts.root || ".";
  var urls = opts.urls || ['/favicon.ico'];
  var blockSize = opts.blockSize || 256 * 32; // 8192 bytes
  
  return function (request, response) {
    if (['GET', 'HEAD'].indexOf(request.requestMethod) !== -1) {
      var match = urls.some(function (u) {
        if (!u.exec) {
          return request.pathInfo.indexOf(u) === 0;
        } else {
          return u.exec(request.pathInfo);
        }
      });

      if (match) {
        var path = Path.join(root, request.pathInfo);
        process.fs.stat(path, 'binary').
          addCallback(function (stats) {
            if (stats.isFile()) {
              var size = stats.size;
              process.fs.open(path, process.O_RDONLY, 0666).
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
 * calls back to process.fs.read until the entire file is read back.
 * 
 * @private
 */
function sendFile(response, fd, size, pos, blockSize) {
  if (pos < size) {
    var len = Math.min(blockSize, size - pos);
    process.fs.read(fd, len, pos, 'binary').
      addCallback(function (content, l) {
        response.sendBody(content, 'binary');
        sendFile(response, fd, size, pos + len, blockSize);
      })
      .addErrback(function () {
        process.fs.close(fd);
        response.finish();
      });
  } else {
    process.fs.close(fd);
    response.finish();
  }
}

function sendNotFound(response, contents) {
  contents = contents || "404 - File Not Found";
  response.sendHeader(404, {
    'content-type': 'text/plain',
    'content-length': contents.length
  });
  response.sendBody(contents);
  response.finish();
}
