var Request   = require('./request');
var Response  = require('./response');
var Lint      = require('./middleware/lint').Lint;
var URI       = require('./uri').URI;

exports.createMockRequest = function createRequest(app) {
  return new MockRequest(app);
}

exports.createMockRequest = function createResponse() {
  return new MockResponse();
}

exports.createMockInput = function createMockInput() {
  return new MockInput();
}

function MockRequest(app) {
  this.app = app;
  this.request = Request.createRequest();
}

MockRequest.prototype = {
  GET: function (uri, opts) {
    return this.request("GET", uri, opts);
  },
  
  HEAD: function (uri, opts) {
    return this.request("HEAD", uri, opts);
  },
  
  POST: function (uri, opts) {
    return this.request("POST", uri, opts);
  },
  
  PUT: function (uri, opts) {
    return this.request("PUT", uri, opts);
  },
  
  DELETE: function (uri, opts) {
    return this.request("DELETE", uri, opts);
  },
  
  request: function (method, uri, opts) {
    opts = opts || {};
    
    var request   = MockRequest.requestFor(method, uri, opts);
    var response  = new MockResponse();
    var app       = this.app;
    
    if (opts.lint) {
      app = Lint(app);
    }
    
    setTimeout(function () {
      app(request, response);
    });
    
    return response;
  }
}

MockRequest.requestFor = function requestFor(method, uri, opts) {
  opts = opts || {};
  
  var uri = new URI(uri);
  
  var request = {};
  
  var request.gateway = {
    "version": [0,3],
    "input": opts["gateway.input"] || new process.EventEmitter(),
    "errors": opts["gateway.errors"] || {},
    "multithread": false,
    "mutliprocess": false,
    "run_once": false
  };
  
  request.requestMethod = method || 'GET';
  request.pathInfo = uri.path || "/";
  request.queryString = uri.query || "";
  request.serverName = uri.host || "example.org";
  request.serverPort = uri.port || 80;
  request.scheme = uri.scheme || "http";
  
  request.scriptName = opts.scriptName || "";
  
  for (var k in opts)
    if (opts.hasOwnProperty(k)) {
      if (!request[k]) {
        request[k] = opts[k];
      }
    }
  
  return request;
}


function MockResponse() {
  
}
process.inherits(MockResponse, process.EventEmitter);

MockResponse.prototype = {
  sendHeader: function (status, headers) {
    this.emit('headers', status, headers);
  },
  
  sendBody: function (chunk) {
    this.emit('body', chunk);
  },
  
  finish: function () {
    this.emit('complete');
  }
}


function MockInput() {
  
}
process.inherits(MockResponse, process.EventEmitter);

MockInput.prototype = {
  sendBody: function (chunk) {
    this.emit('body', chunk);
  },
  
  finish: function () {
    this.emit('complete');
  },
  
  sendData: function (data, chunkSize) {
    chunkSize = chunkSize || 4096;
    for (var i = 0; i < data.length; i+chunkSize) {
      this.sendBody(data.substring(i, i+chunkSize));
    }
  }
}
