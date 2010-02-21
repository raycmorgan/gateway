var fs = require('fs');
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
    if (request.method === 'GET' || request.method === 'HEAD') {
      var match;
      
      // Loop through the urls and compare them to the request path.
      for (var i = 0, len = urls.length; i < len; i++) {
        if (match) break;
        var url = urls[i];
        match = !url.exec ?
          request.pathInfo.indexOf(url) === 0 :
          url.exec(request.pathInfo);
      }

      if (match) {
        var path = Path.join(root, request.pathInfo);
        
        // Stat the file to get the length and ensure it is there.
        fs.stat(path, function (err, stats) {
          if (err) {
            return app(request, response);
          }
          
          if (stats.isFile()) {
            var size = stats.size;
            
            // If HEAD request, just send down the length, screw actually
            // reading the file off of disk.
            if (request.method === 'HEAD') {
              sendHeader(response, size, blockSize);
              response.close();
              return;
            }
            
            fs.open(path, process.O_RDONLY, 0666, function (err, fd) {
              if (err) {
                return app(request, response);
              }
              
              sendHeader(response, size, blockSize);
              sendFile(response, fd, size, 0, blockSize);
            });
          }
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
 * calls back to fs.read until the entire file is read back.
 * 
 * @private
 */
function sendFile(response, fd, size, pos, blockSize) {
  if (pos < size) {
    var len = Math.min(blockSize, size - pos);
    fs.read(fd, len, pos, 'binary', function (err, content) {
      if (err) {
        fs.close(fd);
        response.close();
        return;
      }
      
      response.write(content, 'binary');
      sendFile(response, fd, size, pos + len, blockSize);
    });
  } else {
    fs.close(fd);
    response.close();
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
