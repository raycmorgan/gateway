var http = require('http');
var Response = require('./../response');
var Request = require('./../request');

exports.createHandler = function createHandler(opts) {
  return new NodeHttp(opts);
}

function NodeHttp(opts) {
  this.port = opts.port || 8000;
  this.hostname = opts.hostname || null;
  this.serverName = opts.serverName || this.hostname || "localhost";
  this.serverPort = opts.serverPort || this.port || 8000;
}

NodeHttp.prototype = {
  start: function (app) {
    var self = this;
    
    Request.prototype.serverName = this.serverName;
    Request.prototype.serverPort = this.serverPort;
    Request.prototype.gateway.runonce = false;
    Request.prototype.errors = ErrorStream;
    
    this.server = http.createServer(function (request, response) {
      self.responseHandler(app, request, response);
    });
    
    this.server.listen(this.port, this.hostname);
  },
  
  responseHandler: function (app, nodeRequest, nodeResponse) {
    var request = Request.createRequest();
    var response = Response.createResponse();
    
    // Setup request
    request.method = nodeRequest.method || 'GET';
    request.pathInfo = nodeRequest.uri.path || request.pathInfo;
    request.queryString = nodeRequest.uri.query || request.queryString;
    request.scheme = "http"; // FIXME
    request.remoteAddr = nodeRequest.connection.remoteAddress || null;
    request.serverProtocol = nodeRequest.httpVersion || [1,1];
    
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


var ErrorStream = {
  write: process.stdio.write,
  
  print: function print() {
    for (var i = 0; i < arguments.length; i++) {
      process.stdio.write(arguments[i] + "\n");
    }
  }
}
