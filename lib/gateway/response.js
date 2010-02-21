var sys = require('sys');

module.exports = Response;

function Response() {
  this.buffer = '';
  this.hasSentHeader = false;
  this.chunksSent = 0;
  this.paused = false;
  this.closed = false;
  this.encoding = 'ascii';
}
sys.inherits(Response, process.EventEmitter);

process.mixin(Response.prototype, {
  sendHeader: function (status, headers) {
    var keys = Object.keys(headers);
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i],
          val = headers[key];
      delete headers[key];
      headers[key.toLowerCase()] = val;
    }
    
    this.emit('header', status, headers);
    this.hasSentHeader = true;
  },
  
  write: function (chunk, encoding) {
    this.encoding = encoding;
    if (chunk && !this.paused) {
      this.emit('data', chunk, this.encoding);
      this.emit('flushed');
      this.chunksSent++;
    } else {
      this.buffer += chunk;
    }
  },
  
  close: function () {
    this.emit('end');
    this.closed = true;
  },
  
  pause: function () {
    this.paused = true;
  },
  
  resume: function () {
    this.paused = false;
    this.write(this.buffer)
    this.buffer = '';
  },
  
  toString: function () {
    return "Gateway.Response";
  }
});
