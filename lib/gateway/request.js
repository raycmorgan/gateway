var utils = require('./utils');

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

Request.prototype = {
  /**
   * Determine whether the request body contains form-data by checking
   * the request media_type against registered form-data media-types:
   * "application/x-www-form-urlencoded" and "multipart/form-data". The
   * list of form-data media types can be modified through the
   * +FORM_DATA_MEDIA_TYPES+ array.
   * 
   * @returns {Boolean} True when the request has form data 
   */
  hasFormData: function () {
    var mediaType = this.mediaType();
    
    for (var i = 0; i < FORM_DATA_MEDIA_TYPES.length; i++)
      if (FORM_DATA_MEDIA_TYPES[i] === mediaType) {
        return true;
      }
    
    return false;
  },
  
  /**
   * The media type (type/subtype) portion of the CONTENT_TYPE header
   * without any media type parameters. e.g., when CONTENT_TYPE is
   * "text/plain;charset=utf-8", the media-type is "text/plain".
   * 
   * For more information on the use of media types in HTTP, see:
   * http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.7
   * 
   * @returns {String} The media type of the request
   */
  mediaType: function () {
    var contentType = this.headers.contentType;
    return (
      contentType && contentType.split(/\s*[;,]\s*/, 2)[0].toLowerCase()
    ) || null;
  },
  
  /**
   * The media type parameters provided in CONTENT_TYPE as a Hash, or
   * an empty Hash if no CONTENT_TYPE or media-type parameters were
   * provided.  e.g., when the CONTENT_TYPE is "text/plain;charset=utf-8",
   * this method responds with the following Hash:
   *   { 'charset' => 'utf-8' }
   * 
   * @returns {Object} The media type params
   */
  mediaTypeParams: function () {
    var contentType = this.headers.contentType;
    if (!contentType) return {};
    
    return contentType.split(/\s*[;,]\s*/).slice(1).map(
            function (s) { return s.split('=', 2); }).reduce(
            function (hash, pair) {
                hash[pair[0].toLowerCase()] = pair[1];
                return hash;
            }, {});
  },
  
  /**
   * Gets an object representation of the cookies that the client
   * sent via the Cookie headers.
   * 
   * @returns {Object} The cookies sent by the client
   */
  getCookies: function () {
    if (!this.headers.cookie) return {};
    
    if (this.gateway.cookieString != this.headers.cookie) {
      this.gateway.cookieString = this.headers.cookie;
      
      this.gateway.cookieHash = utils.parseQuery(this.headers.cookie, /[;,]/g);
      
      // According to RFC 2109:
      // If multiple cookies satisfy the criteria above, they are ordered in
      // the Cookie header such that those with more specific Path attributes
      // precede those with less specific. Ordering with respect to other
      // attributes (e.g., Domain) is unspecified.
      var hash = this.gateway.cookieHash;
      for (var k in hash)
        if (hash.hasOwnProperty(k) && Array.isArray(hash[k])) {
          hash[k] = hash[k][0];
        }
    }
    
    return this.gateway.cookieHash;
  },
  
  /**
   * Used to parse the body of an form URL encoded body. These
   * are bodies that usually come from standard HTML forms and
   * are formatted like url GET params.
   * 
   * Because the input stream in Node.js is asynchronous a callback
   * must be provided to this function in order for the body to be
   * buffered for parsing.
   * 
   * @param {Function} callback The function to call once the body has
   *                    successfully finished streaming/parsing. It should
   *                    accept one arg, the parsed body data as an object.
   * @returns {Boolean} True if the body is going to be parsed
   */
  parseURLEncodedBody: function (callback) {
    if (!this.headers['content-length'] && 
        this.headers['content-length'] <= 0 &&
        this.mediaType() !== 'application/x-www-form-urlencoded') {
      return false;
    }
    
    if (this.gateway.bodyHash) {
      callback(this.gateway.bodyHash);
    } else {
      if (this.gateway.bodyBuffer) {
        this.gateway.bodyBuffer.queue.push(callback);
      } else {
        var self = this;
        var buffer = this.gateway.bodyBuffer = {queue: [callback], data: ""};
        
        this.input.
          addListener('body', function (chunk) {
            buffer.data += chunk;
          }).
          addListener('complete', function () {
            var queue = buffer.queue;
            self.gateway.bodyHash = utils.parseQuery(buffer.data);
            for (var i = 0; i < queue.length; i++) {
              queue[i](self.gateway.bodyHash);
            }
            delete buffer.data;
          });
      }
    }
    return true;
  },
  
  /**
   * This is used to get the parsed body of a request that contains one.
   * This will either delegate to parseURLEncodedBody or parseMultipartBody
   * depending on the media type of the request.
   * 
   * Because the input stream in Node.js is asynchronous a callback
   * must be provided to this function in order for the body to be
   * buffered for parsing.
   * 
   * @param {Function} callback The function to call once the body has
   *                    successfully finished streaming/parsing. It should
   *                    accept one arg, the parsed body data as an object.
   * @returns {Boolean} True if the body is going to be parsed
   */
  post: function (callback) {
    if (!this.headers['content-length'] ||
        this.headers['content-length'] <= 0) {
      return false;
    }
    
    var mediaType = this.mediaType()
    if (mediaType !== 'application/x-www-form-urlencoded') {
      return this.parseURLEncodedBody.apply(this, arguments);
    } else if (mediaType !== 'multipart/form-data') {
      throw("Multipart parsing has not been implemented yet. Sorry");
    }
  }
}; // Request.prototype


var FORM_DATA_MEDIA_TYPES = [
  null,
  'application/x-www-form-urlencoded',
  'multipart/form-data'
]
