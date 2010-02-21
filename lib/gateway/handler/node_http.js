var http = require('http');
var url = require('url');
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
    Request.prototype.jsgi.runonce = false;
    Request.prototype.errors = ErrorStream;
    
    this.server = http.createServer(function (request, response) {
      self.responseHandler(app, request, response);
    });
    
    this.server.listen(this.port, this.hostname);
  },
  
  responseHandler: function (app, nodeRequest, nodeResponse) {
    nodeRequest.setBodyEncoding("utf8");
    var request = new Request();
    var response = new Response();
    
    var parsedUrl = url.parse(nodeRequest.url);
    
    // Setup request
    request.method = nodeRequest.method || 'GET';
    request.pathInfo = parsedUrl.pathname || request.pathInfo;
    request.queryString = parsedUrl.query || request.queryString;
    request.scheme = "http"; // FIXME
    request.remoteAddr = nodeRequest.connection.remoteAddress || null;
    request.serverProtocol = nodeRequest.httpVersion || [1,1];
    request.env = {};
    
    request.headers = nodeRequest.headers;
    
    request.input = nodeRequest;
    
    // Setup response
    response.
      addListener('header', function (status, headers) {
        nodeResponse.sendHeader(status, headers);
      }).
      addListener('data', function (chunk, encoding) {
        nodeResponse.write(chunk, encoding || 'binary');
      }).
      addListener('end', function () {
        nodeResponse.close();
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
