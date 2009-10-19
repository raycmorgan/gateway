exports.createResponse = function createResponse() {
  return new Response();
}

function Response() {
  this.hasSentHeader = false;
  this.chunksSent = 0;
  this.finished = false;
}
node.inherits(Response, node.EventEmitter);

node.mixin(Response.prototype, {
  sendHeader: function (status, headers) {
    if (!(headers instanceof Array)) {
      headers = objectToArray(headers);
    }
    
    this.emit('header', status, headers);
    this.hasSentHeader = true;
  },
  
  sendBody: function (chunk) {
    this.emit('body', chunk);
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

function objectToArray(obj) {
  var arr = [];
  
  for (var k in obj)
    if (obj.hasOwnProperty(k)) {
      arr.push([k, obj[k]]);
    }
  
  return arr;
}
