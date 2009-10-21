var http = require('/http.js');
var Response = require('../response.js');

exports.createHandler = function createHandler(opts) {
  return new NodeHttp(opts);
}

function NodeHttp(opts) {
  this.port = opts.port || 8000;
  this.hostname = opts.hostname || null;
}

NodeHttp.prototype = {
  start: function (app) {
    var self = this;
    
    this.server = http.createServer(function (request, response) {
      self.responseHandler(app, request, response);
    });
    
    this.server.listen(this.port, this.hostname);
  },
  
  responseHandler: function (app, nodeRequest, nodeResponse) {
    var response = Response.createResponse();
    response.
      addListener('header', function (status, headers) {
        nodeResponse.sendHeader(status, headers);
      }).
      addListener('body', function (chunk, encoding) {
        nodeResponse.sendBody(chunk, encoding || 'binary');
      }).
      addListener('complete', function () {
        nodeResponse.finish();
      });
    
    var paths = /^(\/[^\/]*)(\/.*)?/.exec(nodeRequest.uri.path);
    
    var request = {
      REQUEST_METHOD: nodeRequest.method || "GET",
      SCRIPT_NAME: paths ? paths[1] : "",
      QUERY_STRING: nodeRequest.uri.query || "",
      SERVER_NAME: this.hostname || "",
      SERVER_PORT: this.port,
      REQUEST_PATH: nodeRequest.uri.path || "",
      PATH_INFO: nodeRequest.uri.path || "",
    };
    
    for (var header in request.headers) {
      if (request.headers.hasOwnProperty(header)) {
        request["HTTP_" + header.toUpperCase().replace("-", "_")] = request.headers[header];
      }
    }
    
    request.error = {
      write: node.stdio.write
    };
    
    request.input = nodeRequest;
    
    app(request, response);
  }
};
