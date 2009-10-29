var Response = require('../response.js');
var mimeTypes = require('../mime.js').MIME_TYPES;
var utils = require('../utils.js');

exports.ContentType = function ContentType(app, opts) {
  opts = opts || {};
  opts.mimeTypes = opts.mimeTypes || {};
  opts.defaultType = opts.defaultType || 'text/plain';
  
  return function (request, response) {
    var myResponse = Response.createResponse();
    var path = request.pathInfo;
    
    myResponse.
      addListener('header', function (status, headers) {
        response.sendHeader(status, setContentType(path, opts, status, headers));
      }).
      addListener('body', function (chunk, encoding) {
        response.sendBody(chunk, encoding);
      }).
      addListener('complete', function () {
        response.finish();
      });
    
    app(request, myResponse);
  }
}

function setContentType(path, opts, status, headers) {
  var containsContentType = Object.keys(headers).some(function (h) { 
    return h[0] === 'content-type';
  });
  
  if (utils.statusHasNoBody(status) || containsContentType) {
    return headers;
  } else {
    var extension = path.match(/(\.[^.]+|)$/)[0];
    var contentType = opts.mimeTypes[extension] || 
                      mimeTypes[extension] || 
                      opts.defaultType;
    headers['content-type'] = contentType;
    return headers;
  }
}