var http = require('/http.js');
var Response = require('../response.js');
var Request = require('../request.js');

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
    var request = Request.createRequest();
    var response = Response.createResponse();
    
    // Setup request
    request.requestMethod = nodeRequest.method || 'GET';
    request.pathInfo = nodeRequest.uri.path || request.pathInfo;
    request.queryString = nodeRequest.uri.query || request.queryString;
    request.serverName = this.hostname || "localhost";
    request.serverPort = this.port || 8000;
    request.scheme = "http"; // FIXME
    
    request.gateway.version = [0,3];
    request.gateway.multithread = false;
    request.gateway.multiprocess = false;
    request.gateway.runonce = false;
    request.gateway.errors = ErrorStream;
    
    request.headers = nodeRequest.headers;
    
    request.input = nodeRequest;
    
    // Setup response
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
    
    // Run the application stack
    app(request, response);
  }
};


ErrorStream = {
  write: node.stdio.write,
  
  print: function print() {
    for (var i = 0; i < arguments.length; i++) {
      node.stdio.write(arguments[i] + "\n");
    }
  }
}
