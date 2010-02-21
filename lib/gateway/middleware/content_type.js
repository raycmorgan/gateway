var Response = require('./../response');
var mimeTypes = require('./../mime').MIME_TYPES;
var utils = require('./../utils');

exports.ContentType = function ContentType(app, opts) {
  opts = opts || {};
  opts.mimeTypes = opts.mimeTypes || {};
  opts.defaultType = opts.defaultType || 'text/plain';
  
  return function (request, response) {
    var myResponse = new Response();
    var path = request.pathInfo;
    
    myResponse.
      addListener('header', function (status, headers) {
        response.sendHeader(status, setContentType(path, opts, status, headers));
      }).
      addListener('data', function (chunk, encoding) {
        response.write(chunk, encoding);
      }).
      addListener('end', function () {
        response.close();
      });
    
    app(request, myResponse);
  }
}

function setContentType(path, opts, status, headers) {
  var containsContentType = Object.keys(headers).indexOf('content-type') !== -1;
  
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
