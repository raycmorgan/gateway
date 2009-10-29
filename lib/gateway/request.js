exports.createRequest = function createRequest() {
  return new Request();
}

function Request() {
  this.requestMethod = null; // Must be set
  this.scriptName = "/";
  this.pathInfo = "/";
  this.queryString = "";
  this.serverName = null; // Must be set
  this.serverPort = null; // Must be set
  this.scheme = null; // Must be set
  
  this.gateway = {};
  this.gateway.version = [0,3];
  this.gateway.multithread = false;
  this.gateway.multiprocess = false;
  this.gateway.runonce = null; // Must be boolean
  this.gateway.errors = null; // response to print(...)
  
  this.headers = {};
  
  this.input = null; // Must be an EventEmitter (emits: 'body' and 'complete')
}

// Request.prototype = {
//   
// }
