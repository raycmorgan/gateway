var sys = require('sys');

exports.createResponse = function createResponse() {
  return new Response();
}

function Response() {
  this.hasSentHeader = false;
  this.chunksSent = 0;
  this.finished = false;
}
sys.inherits(Response, process.EventEmitter);

process.mixin(Response.prototype, {
  sendHeader: function (status, headers) {
    for (var header in headers)
      if (headers.hasOwnProperty(header)) {
        var val = headers[header];
        delete headers[header];
        headers[header.toLowerCase()] = val;
      }
    
    this.emit('header', status, headers);
    this.hasSentHeader = true;
  },
  
  sendBody: function (chunk, encoding) {
    this.emit('body', chunk, encoding);
    this.chunksSent++;
  },
  
  finish: function () {
    this.emit('complete');
    this.finished = true;
  },
  
  toString: function () {
    return "Gateway.Response#{}";
  }
});
